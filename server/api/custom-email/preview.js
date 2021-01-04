import { alertColors } from '../../lib/customEmails/sections/alertSummary';

export default function getPreviewData(emailData, options) {
  const { sections } = emailData;

  options.content.sections = {};

  const mergeVars = sections.map(section => getSectionMockData(section.type));

  mergeVars.forEach(mv => {
    options.content.sections[mv.name] = true;
  });

  mergeVars.push(options);

  return mergeVars;
}

function getSectionMockData(section) {
  const dataObj = {
    alertSummary: {
      name: 'alerts',
      content: [
        {
          description: 'Some alert description',
          details: 'Some alert details',
          rowColor: alertColors.success.row,
          rowBorderColor: alertColors.success.rowBorder,
        },
      ],
    },
  };

  return dataObj[section];
}
