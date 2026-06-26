const express = require('express');
const Lead = require('../models/Lead');
const toCsv = require('../utils/csv');

const router = express.Router();

const headers = [
  { label: 'Name', value: (lead) => lead.name },
  { label: 'Email', value: (lead) => lead.email },
  { label: 'Phone', value: (lead) => lead.phone },
  { label: 'Company', value: (lead) => lead.company },
  { label: 'Source', value: (lead) => lead.source },
  { label: 'Status', value: (lead) => lead.status },
  { label: 'Follow Up Date', value: (lead) => lead.followUpDate?.toISOString() || '' },
  { label: 'Created Date', value: (lead) => lead.createdAt.toISOString() }
];

router.get('/leads.csv', async (req, res, next) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(toCsv(leads, headers));
  } catch (error) {
    next(error);
  }
});

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

router.get('/leads.xls', async (req, res, next) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const headerRow = headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header.label)}</Data></Cell>`).join('');
    const rows = leads
      .map((lead) => {
        const cells = headers
          .map((header) => `<Cell><Data ss:Type="String">${escapeXml(header.value(lead))}</Data></Cell>`)
          .join('');
        return `<Row>${cells}</Row>`;
      })
      .join('');
    const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Leads">
    <Table><Row>${headerRow}</Row>${rows}</Table>
  </Worksheet>
</Workbook>`;

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.xls"');
    res.send(workbook);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
