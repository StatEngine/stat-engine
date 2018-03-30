'use strict';

// import angular from 'angular';
// import uuidv4 from 'uuid/v4';

// import Mailchimp from 'mailchimp-api-v3';
// import config from '../../../../server/config/environment';
// import { FireDepartment, User } from '../../sqldb';

// function validationError(res, statusCode) {
//   statusCode = statusCode || 422;
//   return function(err) {
//     return res.status(statusCode).json(err);
//   };
// }

export default class ResetPasswordController {
  user = {
    email: ''
  };
  errors = {
    resetpass: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Principal, $state) {
    this.Principal = Principal;
    this.$state = $state;
  }

  /**
  * Sends a password reset email.
  */
  resetPassword(form, res) {
    this.submitted = true;
    console.log(form.$valid + res);
    if(form.$valid) {
      // TODO
      // if(config.mailchimp.apiKey && config.mailchimp.listId) {
      //   const mailchimp = new Mailchimp(config.mailchimp.apiKey);
      //   mailchimp.post(`/lists/${config.mailchimp.listId}/members`, {
      //     email_address: this.user.email,
      //     status: 'resetpassword',
      //     merge_fields: {
      //       FNAME: user.first_name,
      //       LNAME: user.last_name
      //     }
      //   }, err => {
      //     if(err) {
      //       console.error(err);
      //     }
      //     res.json(user);
      //   });
      // }
    }

    /**
    * Sends a password reset email.
    */
    // sendPasswordResetEmail(req) {
    //   this.setDataValue('verifyEmailToken', shortid.generate());
    //   this.setDataValue('verifyEmailTokenExpires', Date.now() + (5 * 3600000));

    //   return this.save().then(function (user) {
    //     var resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${user.passwordResetToken}`;

    //     return utils.sendMail({
    //       to: user.email,
    //       template_name: 'nfors-reset-password',
    //       vars: {
    //         'PASSWORD_RESET': resetUrl
    //       }
    //     })
    //   });
    // }
  }
}
