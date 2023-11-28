

// Email template for Account Verification
function getAccountVerificationTemplate(email, firstname, lastname, code){
    
    $emailTemplate = `
        <table style="width:100%;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
            <tbody>
                <tr>
                    <td role="modules-container" style="padding:15px 5px 15px 25px;color:#516775;text-align:left" width="100%" bgcolor="#F9F5F2" align="left">
                        <table role="module" id="header" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td role="module-content">
                                        <p>Welcome to Coopnex</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table role="module" id="sub-header" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td role="module-content" valign="top" height="100%">
                                        <h2>Account Verification</h2>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table role="module" id="body" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td role="module-content" valign="top" height="100%">
                                        <p>Hello ${lastname} (${email}),</p>
                                        <br>
                                        <div style="font-family:inherit">
                                            <span style="font-family:verdana,geneva,sans-serif">
                                                Your verification code is:
                                                <br>
                                            </span>
                                            <span style="font-family:verdana,geneva,sans-serif;">
                                                ${code}
                                                <br>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table role="module" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                <tr>
                                    <td style="padding:0px 0px 0px 0px;font-size:10px;line-height:10px;background-color:#f9f5f2" valign="top" align="center">
                                        <p><br> &copy; Coopnex </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    return $emailTemplate;

}


// Email template for Account Verification
function getPasswordChangeTemplate(email, firstname, lastname, code){
    
    $emailTemplate = `
        <table style="width:100%;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
            <tbody>
                <tr>
                    <td role="modules-container" style="padding:15px 5px 15px 25px;color:#516775;text-align:left" width="100%" bgcolor="#F9F5F2" align="left">
                        <table role="module" id="sub-header" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td role="module-content" valign="top" height="100%">
                                        <h2>Password Change Confirmation</h2>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table role="module" id="body" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td role="module-content" valign="top" height="100%">
                                        <p>Hello ${lastname} (${email}),</p>
                                        <br>
                                        <div style="font-family:inherit">
                                            <span style="font-family:verdana,geneva,sans-serif">
                                                Here is the confirmation code for password change you initiated.
                                                <br>
                                            </span>
                                            <span style="font-family:verdana,geneva,sans-serif; color:wine;">
                                                Do not share this code with anyone.
                                                <br>
                                            </span>
                                            <span style="font-family:verdana,geneva,sans-serif; font-size:20px;">
                                                ${code}
                                                <br>
                                            </span>
										</div>
										
                                        <p>If you didn\'t initiate the password change, please ingore this. </p>
                                        <br>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table role="module" style="table-layout:fixed" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                <tr>
                                    <td style="padding:0px 0px 0px 0px;font-size:15px;line-height:10px;background-color:#f9f5f2" valign="top" align="center">
                                        &copy; Coopnex
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    return $emailTemplate;

}

module.exports = {
    getAccountVerificationTemplate,
    getPasswordChangeTemplate
}