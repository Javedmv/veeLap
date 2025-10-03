const adminModel = require("../../models/adminModel");
const jwt = require("jsonwebtoken")
const jwtKey = require("../../config/jwtAdmin")
const orderModel = require("../../models/orderModel")
const productModel = require("../../models/productModel")
const PDFDocument = require('pdfkit');
const {
  generateSalesReportPDF,
  getWeekOfMonth
} = require('../../utils/sales_report_pdf');

const loadAdminLogin = async (req, res) => {
    try {
        res.render("admin/adminlogin")
    } catch (error) {
        console.log(error)
    }
};

const verifyAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const adminData = await adminModel.findOne({ email: email });
        if (adminData) {
            if (adminData.password == password) {
                const token = jwt.sign(email, jwtKey.secretKey)
                res.cookie("tokenadmin", token, { maxAge: 24 * 60 * 60 * 1000 })
                res.cookie("logged", true, { maxAge: 24 * 60 * 60 * 1000 });
                res.redirect("/admin/");
            } else {
                res.render("admin/adminlogin", { message: "invalid password" });
            }
        } else {
            res.render("admin/adminlogin", { message: "invalid Email" });
        }
    } catch (error) {
        console.log(error.message)
    }
};

const loadDashboard = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        .populate({
            path: 'userId',
            model: 'User'
        })
        .sort({ createdAt: -1 }).limit(4)
        Object.freeze(orders)
        const productLength = await productModel.countDocuments();
        let revenue = 0; 
        orders.forEach(element => {
            if(element.orderStatus != "Cancelled" && element.paymentStatus == "Success"){
            element.returnAmount != 0 ? revenue += element.returnAmount : revenue += element.totalAmount
            }
        });
        res.render("admin/dashboard",{orders,revenue,productLength});
    } catch (error) {
        console.log(error);
    }
};

const adminLogout = async (req, res) => {
    try {
        res.clearCookie("tokenadmin");
        res.clearCookie("logged");
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error);
    }
}

const downloadSalesReport = async (req, res) => {
  try {
  const orders = await orderModel
    .find({})
    .populate({ path: 'userId', model: 'User' })
    .populate({
      path: 'products.productId',
      model: 'Product',
      populate: { path: 'category', model: 'Category' } // This ensures category is populated
    })
    .sort({ orderDate: 1 })
    .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No orders found to generate report' 
      });
    }

    const monthlyData = {};

    orders.forEach(order => {
      if (!order.orderDate) return; // Skip orders without dates
      const date = new Date(order.orderDate);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      const weekOfMonth = getWeekOfMonth(date);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
          monthNum: date.getMonth(),
          year: date.getFullYear(),
          weeks: {}
        };
      }
      if (!monthlyData[monthKey].weeks[weekOfMonth]) {
        monthlyData[monthKey].weeks[weekOfMonth] = [];
      }
      monthlyData[monthKey].weeks[weekOfMonth].push(order);
    });
    if (Object.keys(monthlyData).length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No valid orders found to generate report' 
      });
    }
    const doc = new PDFDocument({ 
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true
    });
    const filename = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Error generating PDF report' 
        });
      }
    });
    res.on('error', (err) => {
      console.error('Response stream error:', err);
      doc.end();
    });
    doc.pipe(res);
    generateSalesReportPDF(doc, monthlyData);
    doc.end();
  } catch (err) {
    console.error('Sales report generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate sales report',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

module.exports = {
  loadAdminLogin,
  verifyAdmin,
  loadDashboard,
  adminLogout,
  downloadSalesReport
};