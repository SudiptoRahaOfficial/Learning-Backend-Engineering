// importing dependencis
const crypto = require('crypto')

// function for generating OTP
function generateSecureOTP(length = 6) {
	// Generates a cryptographically secure random integer
	const min = Math.pow(10, length - 1)
	const max = Math.pow(10, length) - 1
	return crypto.randomInt(min, max + 1).toString()
}

// function for generating otp email body html
function generateEmailBodyHtml(otp) {
	// escaping dynamic content before inserting it into HTML
	const escapedOtp = String(otp)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')

	// returning email body html
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<title>Email Verification Code</title>
</head>

<body style="
	margin: 0;
	padding: 0;
	background-color: #f4f6f8;
	font-family: Arial, Helvetica, sans-serif;
	color: #1f2937;
">

	<table
		role="presentation"
		width="100%"
		cellspacing="0"
		cellpadding="0"
		border="0"
		style="width: 100%; background-color: #f4f6f8;"
	>
		<tr>
			<td align="center" style="padding: 40px 16px;">

				<table
					role="presentation"
					width="100%"
					cellspacing="0"
					cellpadding="0"
					border="0"
					style="
						max-width: 520px;
						width: 100%;
						background-color: #ffffff;
						border-radius: 8px;
						border: 1px solid #e5e7eb;
					"
				>
					<tr>
						<td style="padding: 40px 32px;">

							<!-- Header -->
							<h1 style="
								margin: 0 0 24px;
								font-size: 24px;
								line-height: 32px;
								font-weight: 600;
								color: #111827;
								text-align: center;
							">
								Verify Your Email
							</h1>

							<!-- Introduction -->
							<p style="
								margin: 0 0 16px;
								font-size: 16px;
								line-height: 24px;
								color: #4b5563;
								text-align: center;
							">
								Use the verification code below to verify your email address.
							</p>

							<!-- OTP -->
							<table
								role="presentation"
								width="100%"
								cellspacing="0"
								cellpadding="0"
								border="0"
							>
								<tr>
									<td align="center" style="padding: 16px 0 24px;">

										<div style="
											display: inline-block;
											padding: 16px 24px;
											background-color: #f3f4f6;
											border: 1px solid #d1d5db;
											border-radius: 8px;
											font-size: 32px;
											line-height: 40px;
											font-weight: 700;
											letter-spacing: 8px;
											color: #111827;
											font-family: Arial, Helvetica, sans-serif;
										">
											${escapedOtp}
										</div>

									</td>
								</tr>
							</table>

							<!-- Expiration -->
							<p style="
								margin: 0 0 16px;
								font-size: 14px;
								line-height: 21px;
								color: #6b7280;
								text-align: center;
							">
								This verification code will expire in <strong>10 minutes</strong>.
							</p>

							<!-- Security notice -->
							<p style="
								margin: 0;
								font-size: 14px;
								line-height: 21px;
								color: #6b7280;
								text-align: center;
							">
								If you did not request this code, you can safely ignore this email.
								Do not share this code with anyone.
							</p>

						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="
							padding: 20px 32px;
							border-top: 1px solid #e5e7eb;
						">
							<p style="
								margin: 0;
								font-size: 12px;
								line-height: 18px;
								color: #9ca3af;
								text-align: center;
							">
								This is an automated email. Please do not reply to this message.
							</p>
						</td>
					</tr>

				</table>

			</td>
		</tr>
	</table>

</body>
</html>
`
}

// exporting functions
module.exports = {
	generateSecureOTP,
	generateEmailBodyHtml,
}