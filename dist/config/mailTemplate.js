"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const sendOtp = (data) => {
    const result = `<!DOCTYPE html>
      <html>
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      
          <title>Geekstack</title>
      
          <style>
      
              body {margin:0; padding:0; -webkit-text-size-adjust:none; -ms-text-size-adjust:none;} img{line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;} a img{border: none;} #backgroundTable {margin:0; padding:0; width:100% !important; } a, a:link{color:#2A5DB0; text-decoration: underline;} table td {border-collapse:collapse;} span {color: inherit; border-bottom: none;} span:hover { background-color: transparent; }
      
          </style>
      
          <style>
              .scalable-image img{max-width:100% !important;height:auto !important}.button a{transition:background-color .25s, border-color .25s}.button a:hover{background-color:#e1e1e1 !important;border-color:#0976a5 !important}@media only screen and (max-width: 400px){.preheader{font-size:12px !important;text-align:center !important}.header--white{text-align:center}.header--white .header__logo{display:block;margin:0 auto;width:118px !important;height:auto !important}.header--left .header__logo{display:block;width:118px !important;height:auto !important}}@media screen and (-webkit-device-pixel-ratio), screen and (-moz-device-pixel-ratio){.sub-story__image,.sub-story__content{display:block
                  !important}.sub-story__image{float:left !important;width:200px}.sub-story__content{margin-top:30px !important;margin-left:200px !important}}@media only screen and (max-width: 550px){.sub-story__inner{padding-left:30px !important}.sub-story__image,.sub-story__content{margin:0 auto !important;float:none !important;text-align:center}.sub-story .button{padding-left:0 !important}}@media only screen and (max-width: 400px){.featured-story--top table,.featured-story--top td{text-align:left}.featured-story--top__heading td,.sub-story__heading td{font-size:18px !important}.featured-story--bottom:nth-child(2) .featured-story--bottom__inner{padding-top:10px
                      !important}.featured-story--bottom__inner{padding-top:20px !important}.featured-story--bottom__heading td{font-size:28px !important;line-height:32px !important}.featured-story__copy td,.sub-story__copy td{font-size:14px !important;line-height:20px !important}.sub-story table,.sub-story td{text-align:center}.sub-story__hero img{width:100px !important;margin:0 auto}}@media only screen and (max-width: 400px){.footer td{font-size:12px !important;line-height:16px !important}}
                      @media screen and (max-width:600px) {
                          table[class="columns"] {
                              margin: 0 auto !important;float:none !important;padding:10px 0 !important;
                          }
                          td[class="left"] {
                              padding: 0px 0 !important;
                          </style>
      
                      </head>
      
                      <body style="background: transparent;font-family:Arial, Helvetica, sans-serif; font-size:1em;">
      
                          <style type="text/css">
                              div.preheader 
                              { display: none !important; } 
                          </style>
                          <div class="preheader" style="font-size: 1px; display: none !important;"></div>
                          <table cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td class="featured-story__heading featured-story--top__heading" style="background: #fff;" width="640" align="left">
                                          <table cellspacing="0" cellpadding="0">
                                              <tr>
                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 18px; color: #464646;" width="400" align="left">
                                                  Dear ${data === null || data === void 0 ? void 0 : data.name},
                                                  </td>
                                              </tr> 
  
                                              <tr>
                                              <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 18px; color: #464646; padding-top:25px" width="400" align="left">
                                                  Happy Day!
                                                  </td>
                                              </tr>
  
                                              <tr>
                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 18px; color: #464646;padding-top:5px" width="400" align="left">
                                                  Your OTP  : ${data === null || data === void 0 ? void 0 : data.otp}
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </body>
                          </html>`;
    return result;
};
exports.sendOtp = sendOtp;
