export const changePasswordTemplate = () =>
    `<!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0" />
            <title>Password Changed</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .email-container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    width: 100%;
                    text-align: center;
                }
                .company-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                }
                .company-logo {
                    height: 50px;
                    margin-right: 15px;
                }
                .company-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #333333;
                }
                .email-header {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .email-body {
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .footer {
                    font-size: 12px;
                    color: #666666;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="company-header">
                    <img
                        src="https://my-projects-images.s3.ap-south-1.amazonaws.com/careerGo/logoIcon.png"
                        alt="Company Logo"
                        class="company-logo"
                        loading="lazy" />
                    <div class="company-name">Career Go</div>
                </div>
                <div class="email-header">Password Changed</div>
                <div class="email-body">
                    <p>Your password has been successfully changed.</p>
                    <p>If you didn’t make this change, please contact our support team immediately to secure your account.</p>
                </div>
                <div class="footer">If you have any questions, feel free to contact our support team.</div>
            </div>
        </body>
    </html>
`
