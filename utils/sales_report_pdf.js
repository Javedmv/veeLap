// ==================== UTILITY FUNCTIONS ====================

/**
 * Format number as currency (Indian Rupees)
 */
function formatCurrency(amount) {
  const numAmount = Number(amount) || 0;
  return 'INR ' + numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate which week of the month a date falls into
 */
function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
}

/**
 * Safely extract numeric value
 */
function toNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// ==================== DRAWING FUNCTIONS ====================

/**
 * Draw a bordered box with title and content rows
 */
function drawBox(doc, { x = 40, y = doc.y, width = 515, height = 120, title, rows = [] }) {
  // Draw box border
  doc.rect(x, y, width, height).stroke();

  let currentY = y + 10;

  // Draw title if provided
  if (title) {
    doc.font('Helvetica-Bold').fontSize(14).text(title, x + 10, currentY, {
      width: width - 20,
      align: 'left'
    });
    currentY += 22;
    doc.font('Helvetica').fontSize(11);
  }

  // Draw content rows
  rows.forEach((row) => {
    doc.text(row, x + 10, currentY, {
      width: width - 20,
      align: 'left'
    });
    currentY += 18;
  });

  // Move document cursor below the box
  doc.y = y + height + 15;
}

/**
 * Check if we need a new page and add one if necessary
 */
function ensureSpace(doc, requiredSpace = 150) {
  if (doc.y + requiredSpace > 700) {
    doc.addPage();
  }
}

// ==================== STATISTICS CALCULATION ====================

/**
 * Calculate weekly statistics from orders
 */
function getWeekStats(orders, weekOfMonth, month) {
  let totalSale = 0;
  let totalReturn = 0;
  const laptopCount = {};

  orders.forEach(order => {
    const isValidOrder = order.orderStatus !== 'Cancelled' && order.paymentStatus === 'Success';
    
    if (isValidOrder) {
      totalSale += toNumber(order.totalAmount);

      order.products.forEach(product => {
        const productName = product.productId?.productName || 'Unknown Product';
        const quantity = toNumber(product.quantity);
        laptopCount[productName] = (laptopCount[productName] || 0) + quantity;
      });
    }

    if (order.orderStatus === 'Returned') {
      totalReturn += toNumber(order.returnAmount);
    }
  });

  // Find best selling product
  let bestLaptop = 'No sales this week';
  let bestCount = 0;
  
  Object.entries(laptopCount).forEach(([name, count]) => {
    if (count > bestCount) {
      bestLaptop = name;
      bestCount = count;
    }
  });

  return {
    weekOfMonth,
    month,
    totalSale,
    totalReturn,
    netRevenue: totalSale - totalReturn,
    bestLaptop
  };
}

/**
 * Calculate monthly statistics from orders
 */
function getMonthStats(orders, monthName) {
  let totalSale = 0;
  let totalReturn = 0;
  const productCount = {};
  const categoryCount = {};

  orders.forEach(order => {
    const isValidOrder = order.orderStatus !== 'Cancelled' && order.paymentStatus === 'Success';
    
    if (isValidOrder) {
      totalSale += toNumber(order.totalAmount);

      order.products.forEach(product => {
        const productName = product.productId?.productName || 'Unknown Product';
        const category = product.productId?.category?.categoryName || 'Uncategorized';
        const quantity = toNumber(product.quantity);

        productCount[productName] = (productCount[productName] || 0) + quantity;
        categoryCount[category] = (categoryCount[category] || 0) + quantity;
      });
    }

    if (order.orderStatus === 'Returned') {
      totalReturn += toNumber(order.returnAmount);
    }
  });

  // Get top 3 products
  const topLaptops = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Find best selling category
  let bestCategory = 'No category data';
  let maxCategoryCount = 0;
  
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count > maxCategoryCount) {
      bestCategory = category;
      maxCategoryCount = count;
    }
  });

  const profit = totalSale - totalReturn;

  return {
    month: monthName,
    totalSale,
    totalReturn,
    profit,
    topLaptops,
    bestCategory
  };
}

// ==================== RENDERING FUNCTIONS ====================

/**
 * Render weekly reports for a given month
 */
function renderWeeklyReports(doc, monthData) {
  const weekNumbers = Object.keys(monthData.weeks)
    .map(Number)
    .sort((a, b) => a - b);

  // Section title
  doc.fontSize(16)
    .fillColor('black')
    .text(`${monthData.month} - Weekly Report`, { underline: true });
  doc.moveDown(1);

  weekNumbers.forEach((weekNum) => {
    const weekOrders = monthData.weeks[weekNum];
    
    ensureSpace(doc);

    if (!weekOrders || weekOrders.length === 0) {
      drawBox(doc, {
        title: `Week ${weekNum} of ${monthData.month}`,
        rows: ['No orders recorded for this week']
      });
      return;
    }

    const weekStats = getWeekStats(weekOrders, weekNum, monthData.month);

    drawBox(doc, {
      title: `Week ${weekStats.weekOfMonth} of ${weekStats.month}`,
      rows: [
        `Total Sales: ${formatCurrency(weekStats.totalSale)}`,
        `Returned Amount: ${formatCurrency(weekStats.totalReturn)}`,
        `Net Revenue: ${formatCurrency(weekStats.netRevenue)}`,
        `Best Selling Product: ${weekStats.bestLaptop}`
      ]
    });
  });
}

/**
 * Render monthly summary page
 */
function renderMonthlySummary(doc, monthStats) {
  doc.addPage();
  
  // Page title
  doc.fontSize(18)
    .fillColor('black')
    .text(`Monthly Summary: ${monthStats.month}`, {
      underline: true,
      align: 'center'
    });
  doc.moveDown(1.5);

  // Calculate dynamic height based on number of top products
  const baseHeight = 120;
  const topProductsHeight = monthStats.topLaptops.length * 18;
  const dynamicHeight = baseHeight + topProductsHeight + 20;

  // Build rows for the summary box
  const rows = [
    `Total Sales: ${formatCurrency(monthStats.totalSale)}`,
    `Returned Amount: ${formatCurrency(monthStats.totalReturn)}`,
    `Net Profit: ${formatCurrency(monthStats.profit)}`,
    '',
    'Top Selling Products:'
  ];

  if (monthStats.topLaptops.length > 0) {
    monthStats.topLaptops.forEach((laptop, index) => {
      rows.push(`  ${index + 1}. ${laptop.name} (${laptop.count} units)`);
    });
  } else {
    rows.push('  No products sold this month');
  }

  drawBox(doc, {
    height: dynamicHeight,
    title: 'Monthly Overview',
    rows
  });

  // Add best category below the box
  doc.moveDown(0.5);
  doc.fontSize(12)
    .fillColor('black')
    .text(`Best Selling Category: ${monthStats.bestCategory}`, 50, doc.y);
}

// ==================== MAIN PDF GENERATION ====================

/**
 * Generate complete sales report PDF
 */
function generateSalesReportPDF(doc, monthlyData) {
  // Report title
  doc.fontSize(22)
    .fillColor('black')
    .text('Sales Report', { align: 'center', underline: true });
  doc.moveDown(2);

  // Sort months chronologically
  const monthKeys = Object.keys(monthlyData).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    return yearA !== yearB ? yearA - yearB : monthA - monthB;
  });

  monthKeys.forEach((monthKey, index) => {
    const monthData = monthlyData[monthKey];
    
    // Render weekly reports
    renderWeeklyReports(doc, monthData);

    // Gather all orders for the month
    const allMonthOrders = Object.values(monthData.weeks).flat();
    const monthStats = getMonthStats(allMonthOrders, monthData.month);

    // Render monthly summary
    renderMonthlySummary(doc, monthStats);

    // Add page break between months (except for the last month)
    if (index < monthKeys.length - 1) {
      doc.addPage();
    }
  });
}

module.exports = {
  generateSalesReportPDF,
  getWeekOfMonth,
  getMonthStats,
  formatCurrency
};