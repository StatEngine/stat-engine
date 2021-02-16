import { Sequelize } from 'sequelize';

/**
 *
 * Database representation of a custom email. A custom email is similar
 * to the daily notification emails that departments get, but can be
 * created/edited/deleted/scheduled via UI on the stat-engine client.
 */
export default function(sequelize, DataTypes) {
  const CustomEmail = sequelize.define('CustomEmail', {
    _id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    /**
     * since CustomEmails are managed via users of the webapp,
     * users are associated with a fire department. this is the
     * fire department id, used for accessing the FireDepartment
     * table. see server/api/fire-department/fire-department.model.js
     */
    fd_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * just an identifier for this custom email that is set by the
     * user on creation
     */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * if the user wants to add more details about the custom email
     */
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * this is a later.js parsable string. used to schedule when to
     * send the custom email. a custom email can be scheduled EITHER
     * with the schedule, OR using by_shift (see by_shift comment), but
     * not both.
     *
     * LasterJS docs: https://bunkat.github.io/later/parsers.html#text
     */
    schedule: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * allows the user to pause and restart sending the custom email
     */
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    /**
     * if the user sets this to true, then the schedule (see schedule comment) will
     * be ignored. and instead, the custom email will make use of the shiftly package
     * to look up the fire department's shift schedule and the custom email will be
     * scheduled to be sent shortly after the conclusion of each shift.
     */
    by_shift: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    /**
     * the user will select at least one section to be added to the custom email. a
     * section is made up of a handlebars template (/server/api/email/templates/partials)
     * and an associated file for handling data to display in the template (/server/lib/emails/sections).
     */
    sections: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * the user can select one or more email addresses to send the custom email to
     */
    email_list: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: { notEmpty: true },
    },

    /**
     * we keep track of the last time the custom email was sent, so that we can generate
     * the time span for looking up the fire department data.
     */
    last_sent: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    underscored: true, // auto set field option for all attributes to snake case
    timestamps: true, // auto add updateAt & createdAt timestamps
  });

  return CustomEmail;
}
