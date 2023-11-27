// <%- include("../partials/user-header")%>


//     <main class="main">
//         <section class="pt-150 pb-150">
//             <div class="container">
//                 <div class="row">
//                     <div class="col-lg-10 m-auto">
//                         <div class="row  d-flex align-items-center justify-content-center" >

//                             <div class="col-lg-6">
//                                 <div class="login_wrap widget-taber-content p-30 background-white border-radius-5">
//                                     <div class="padding_eight_all bg-white">
//                                         <div class="heading_s1">
//                                             <h3 class="mb-30">Create an Account</h3>
//                                         </div>
//                                         <%if (typeof error !== 'undefined') {%>
//                                             <p class="text-center" style="color:red;"><%= error %></p>
//                                         <%}%>

//                                         <form method="post" action="/post-signup" onsubmit="return validateForm()">
//                                             <div class="form-group">
//                                                 <input type="text" required="" name="username" placeholder="Username" id="username">
//                                                 <div id="usernameError" class="error-message"></div>
//                                             </div>
//                                             <div class="form-group">
//                                                 <input type="text" required="" name="email" placeholder="Email" id="email">
//                                                 <div id="emailError" class="error-message"></div>
//                                             </div>
//                                             <div class="form-group">
//                                                 <input required="" type="password" name="password" placeholder="Password" id="password">
//                                                 <div id="passwordError" class="error-message"></div>
//                                             </div>
//                                             <div class="form-group">
//                                                 <input required="" type="password" name="confirmpassword" placeholder="Confirm password" id="confirmpassword">
//                                                 <div id="confirmpasswordError" class="error-message"></div>
//                                             </div>
//                                             <div class="form-group">
//                                                 <input type="number" required="" name="phoneNumber" placeholder="Phone Number" id="phoneNumber">
//                                                 <div id="phoneNumberError" class="error-message"></div>
//                                             </div>
//                                             <div class="form-group">
//                                                 <button type="button" class="btn btn-sm btn-fill-out btn-block hover-up" data-mdb-ripple-color="dark" id="sendOTPButton" name="sendOTPBtn" onclick="sendOTP()">Send OTP</button>
//                                             </div>

//                                             <div class="form-group">
//                                                 <input type="text" required="" name="otpInput" placeholder="Enter OTP" id="otpInput">
//                                             </div>

//                                             <div class="form-group">
//                                                 <div id="timer" class="mb-3" style="display: none; color: blue;"></div>
//                                             </div>
                                            
//                                             <div class="form-group">
//                                                 <button class="btn btn-primary" type="button" id="resendOTPButton" style="display: none;">Resend OTP</button>
//                                             </div>
                                            

//                                             <div class="form-group">
//                                                 <button type="button" class="btn btn-sm btn-fill-out btn-block hover-up" id="verifyOTPButton" name="verifyOTPBtn">Verify OTP</button>
//                                             </div>
//                                             <div class="login_footer form-group">
//                                                 <!-- <div class="chek-form">
//                                                     <div class="custome-checkbox">
//                                                         <input class="form-check-input" type="checkbox" name="checkbox" id="exampleCheckbox12" value="">
//                                                         <label class="form-check-label" for="exampleCheckbox12"><span>I agree to terms &amp; Policy.</span></label>
//                                                     </div>
//                                                 </div> -->
//                                             </div>
//                                             <div class="form-group">
//                                                 <button type="submit" class="btn btn-fill-out btn-block hover-up" name="loginbtn" id="submitButton">Submit &amp; Register</button>
//                                             </div>
//                                         </form>
                                        
//                                         <div class="text-muted text-center">Already have an account? <a href="/login">Sign in now</a></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     </main>
    
//     <!-- Preloader Start -->
//     <!-- <div id="preloader-active">
//         <div class="preloader d-flex align-items-center justify-content-center">
//             <div class="preloader-inner position-relative">
//                 <div class="text-center">
//                     <h5 class="mb-5">Now Loading</h5>
//                     <div class="loader">
//                         <div class="bar bar1"></div>
//                         <div class="bar bar2"></div>
//                         <div class="bar bar3"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div> -->

    
//     <!-- for sending otp and verifing -->
//     <script>
//         // function enableVerifyButton(enable) {
//         // const verifyOTPButton = document.getElementById("verifyOTPButton");
//         // verifyOTPButton.disabled = !enable;
//         // }
//         submitButton.disabled = true;
        
//         let timerElement = document.getElementById('timer');
//         let countdown;

//         const sendOTPButton = document.getElementById("sendOTPButton");
//         const resendOTPButton = document.getElementById("resendOTPButton");
//         const verifyOTPButton = document.getElementById("verifyOTPButton");

//         sendOTPButton.addEventListener("click", function (e) {
//             e.preventDefault();

//             // Validate the form before sending OTP
//             if (validateForm()) {
//                 const email = document.querySelector('input[name="email"]').value;
//                 const phoneNumber = document.querySelector('input[name="phoneNumber"]').value;

//                 fetch(/send-otp?email=${email}&phoneNumber=${phoneNumber})
//                     .then((response) => {
//                         if (!response.ok) {
//                             throw new Error(HTTP error! status: ${response.status});
//                         }
//                         return response.json();
//                     })
//                     .then((data) => {
//                         console.log("Response from server", data);

//                     if (data.error) {
//                     // User already exists, display error message
//                     Swal.fire({
//                         position: 'top-center',
//                         icon: 'error',
//                         title: data.error,
//                         showConfirmButton: false,
//                         timer: 1500
//                     });
//                     } else {
//                     // User doesn't exist, continue with OTP sending logic
//                     Swal.fire({
//                         position: 'top-center',
//                         icon: 'success',
//                         title: 'OTP sent to email successfully',
//                         showConfirmButton: false,
//                         timer: 1500
//                     });
//                     startResendTimer();
//                     }
//                     })
//                     .catch((error) => {
//                         console.error("Error sending OTP", error);
//                     });
//             } else {
//                 // Form is not valid, display an error message or handle it accordingly
//                 // alert('Form is not valid. Please check your inputs.');
//                 // Swal.fire({
//                 //     icon: "error",
//                 //     title: "Oops...",
//                 //     text: "Error sending OTP.",
//                 //     footer: '<a href="#">Why do I have this issue?</a>'
//                 //     });
//             }
//             // enableVerifyButton(true);
//         });

        

//         resendOTPButton.addEventListener("click", function (e) {
//             e.preventDefault();

//             clearInterval(countdown);
//             // Validate the form before sending OTP
//             if (validateForm()) {
//                 const email = document.querySelector('input[name="email"]').value;
//                 const phoneNumber = document.querySelector('input[name="phoneNumber"]').value;

//                 fetch(/send-otp?email=${email}&phoneNumber=${phoneNumber})
//                     .then((response) => {
//                         if (!response.ok) {
//                             throw new Error(HTTP error! status: ${response.status});
//                         }
//                         return response.json();
//                     })
//                     .then((data) => {
//                         console.log("Response from server", data);

//                     if (data.error) {
//                     // User already exists, display error message
//                     Swal.fire({
//                         position: 'top-center',
//                         icon: 'error',
//                         title: data.error,
//                         showConfirmButton: false,
//                         timer: 1500
//                     });
//                     } else {
//                     // User doesn't exist, continue with OTP sending logic
//                     Swal.fire({
//                         position: 'top-center',
//                         icon: 'success',
//                         title: 'OTP sent to email successfully',
//                         showConfirmButton: false,
//                         timer: 1500
//                     });
//                     startResendTimer();
//                     }
//                     })
//                     .catch((error) => {
//                         console.error("Error sending OTP", error);
//                     });
//             } else {
//                 // Form is not valid, display an error message or handle it accordingly
//                 // alert('Form is not valid. Please check your inputs.');
//                 // Swal.fire({
//                 //     icon: "error",
//                 //     title: "Oops...",
//                 //     text: "Error sending OTP.",
//                 //     footer: '<a href="#">Why do I have this issue?</a>'
//                 //     });
//             }
//             // enableVerifyButton(true);
//         });

//         function startResendTimer() {
//             let remainingTime = 5;
//             timerElement.style.display = "block";
//             resendOTPButton.style.display = "none";
//             sendOTPButton.style.display = "none"; // Hide the sendOTPButton

//             countdown = setInterval(() => {
//                 timerElement.textContent = Resend in ${remainingTime} seconds;
//                 remainingTime--;

//                 if (remainingTime < 0) {
//                     clearInterval(countdown);
//                     timerElement.style.display = "none";
//                     resendOTPButton.style.display = "block";
//                     sendOTPButton.style.display = "none"; // Ensure sendOTPButton is hidden when timer expires
//                 }
//             }, 1000);
//         }

//         // Function to validate the form
//         function validateForm() {
//             // Reset previous error messages
//             resetErrorMessages();

//             const username = document.getElementById('username').value;
//             const email = document.getElementById('email').value;
//             const password = document.getElementById('password').value;
//             const confirmPassword = document.getElementById('confirmpassword').value;
//             const phoneNumber = document.getElementById('phoneNumber').value;

//             // Validate username (should contain only characters without whitespace)
//             const usernamePattern = /^[A-Za-z]+$/;
//             if (!username.match(usernamePattern)) {
//                 showError('usernameError', 'Username should contain only characters without whitespace');
//                 return false;
//             }

//             // Validate email
//             const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
//             if (!email.match(emailPattern)) {
//                 showError('emailError', 'Invalid email address');
//                 return false;
//             }

//             // Validate password length
//             if (password.length < 6) {
//                 showError('passwordError', 'Password must be at least 6 characters');
//                 return false;
//             }

//             // Validate password confirmation
//             if (password !== confirmPassword) {
//                 showError('confirmpasswordError', 'Passwords do not match');
//                 return false;
//             }

//             // Validate phoneNumber (should be a number with exactly 10 digits)
//             if (isNaN(phoneNumber) || phoneNumber.length !== 10) {
//                 showError('phoneNumberError', 'Phone number must be a number with exactly 10 digits');
//                 return false;
//             }

//             return true; // Placeholder, replace with your actual validation logic
//         }

//             // Function to show error message
//         function showError(elementId, message) {
//             const errorElement = document.getElementById(elementId);
//             errorElement.textContent = message;
//         }

//         // Function to reset error messages
//         function resetErrorMessages() {
//             const errorElements = document.querySelectorAll('.error-message');
//             errorElements.forEach((element) => {
//                 element.textContent = '';
//             });
//         }


//         // verify otp

//         verifyOTPButton.addEventListener("click", function(e) {
//             e.preventDefault();

//             // const phoneNumber = document.querySelector('input[name="phoneNumber"]').value;
//             const otpInput = document.querySelector('input[name="otpInput"]').value;
//             fetch(/verify-otp?otpInput=${otpInput},{
//                 method: "POST"})
            
//             .then((Response) => {
//                 if(!Response.ok) {
//                     throw new Error(HTTP error! status: ${Response.status})
//                 }
//                 return Response.json();
//             })
//             .then((data)=>{
//                 console.log("Response from serve", data)
//                 Swal.fire({
//                     position: 'top-center',
//                     icon: 'success',
//                     title: 'OTP verified succssfully',
//                     showConfirmButton: false,
//                     timer: 1500
//                 })
//                 // startResendTimer()
//                 submitButton.disabled = false;  

//             })
//             .catch((error)=>{
//                 console.error("Invalid OTP",error);
//                 Swal.fire({
//                 position: 'top-center',
//                 icon: 'error',
//                 title: "Invalid OTP",
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//             })
//         }) 

//     </script>

//     <!-- script for twilio -->
//     <!-- <script>
//         const sendOTPButton = document.getElementById("sendOTPButton")
//         const verifyOTPButton = document.getElementById("verifyOTPButton")   

//         // send OTP
//         sendOTPButton.addEventListener("click",function(e) {
//             e.preventDefault()

//             // const username = document.querySelector('input[name="username"]').value;
//             const email = document.querySelector('input[name="email"]').value;   
//             // const password = document.querySelector('input[name="password"]').value;
//             const phoneNumber = document.querySelector('input[name="phoneNumber"]').value; 

//             fetch(/send-otp?email=${encodeURIComponent(email)}&phoneNumber=${encodeURIComponent(phoneNumber)})

//             .then((Response)=> {
//                 if(!Response.ok) {
//                     throw new Error(HTTP error! status: ${Response.status})
//                 }
//                 return Response.json() 
//             })
//             .then ((data) => {
//                 console.log("response from server", data)
//                 Swal.fire({
//                     position: 'top-center',
//                     icon: 'success',
//                     title: 'OTP send succssfully',
//                     showConfirmButton: false,
//                     timer: 1500
//                 })
//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 1500);
//             })

//             .catch((error) => {
//                 console.error("Error sending OTP", error);
//             })
//         })

//         verifyOTPButton.addEventListener("click",function(e) {
//             e.preventDefault()

//             const otpInput = document.querySelector('input[name="otpInput"]').value;

//             fetch(/verify-otp?otpInput=${otpInput},{
//                 method: "POST"})

//             .then((Response)=> {
//             if(!Response.ok) {
//                 throw new Error(HTTP error! status: ${Response.status})
//             }
//             return Response.json() 
//             })
//             .then ((data) => {
//                 console.log("response from server", data)
//                 Swal.fire({
//                     position: 'top-center',
//                     icon: 'success',
//                     title: 'OTP send succssfully',
//                     showConfirmButton: false,
//                     timer: 1500
//                 })
//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 1500);
//             })

//             .catch((error) => {
//                 console.error("Error sending OTP", error);
//             })

//         })
//     </script> -->
    

//     <!-- Vendor JS-->
//     <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10"></script>


//     <script src="/userAssets/js/vendor/modernizr-3.6.0.min.js"></script>
//     <script src="/userAssets/js/vendor/jquery-3.6.0.min.js"></script>
//     <script src="/userAssets/js/vendor/jquery-migrate-3.3.0.min.js"></script>
//     <script src="/userAssets/js/vendor/bootstrap.bundle.min.js"></script>
//     <script src="/userAssets/js/plugins/slick.js"></script>
//     <script src="/userAssets/js/plugins/jquery.syotimer.min.js"></script>
//     <script src="/userAssets/js/plugins/wow.js"></script>
//     <script src="/userAssets/js/plugins/jquery-ui.js"></script>
//     <script src="/userAssets/js/plugins/perfect-scrollbar.js"></script>
//     <script src="/userAssets/js/plugins/magnific-popup.js"></script>
//     <script src="/userAssets/js/plugins/select2.min.js"></script>
//     <script src="/userAssets/js/plugins/waypoints.js"></script>
//     <script src="/userAssets/js/plugins/counterup.js"></script>
//     <script src="/userAssets/js/plugins/jquery.countdown.min.js"></script>
//     <script src="/userAssets/js/plugins/images-loaded.js"></script>
//     <script src="/userAssets/js/plugins/isotope.js"></script>
//     <script src="/userAssets/js/plugins/scrollup.js"></script>
//     <script src="/userAssets/js/plugins/jquery.vticker-min.js"></script>
//     <script src="/userAssets/js/plugins/jquery.theia.sticky.js"></script>
//     <!-- Template  JS -->
//     <script src="/userAssets/js/maind134.js?v=3.4"></script>

//     <%- include("../partials/user-footer")%>