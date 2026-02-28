function determineRiskLevel(deadline, openTasksCount) {
  if (!deadline) return 'Low';
  const now = new Date();
  const diffMs = new Date(deadline) - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 3) return 'High';
  if (diffDays < 7) return 'Medium';
  return 'Low';
}

function buildCaseSummary({ caseDoc, client, openTasks, missingDocuments }) {
  const openTasksCount = openTasks.length;
  const riskLevel = determineRiskLevel(caseDoc.deadline, openTasksCount);

  const missingDocList =
    missingDocuments && missingDocuments.length
      ? missingDocuments.join(', ')
      : 'None';

  return (
    `Case Summary:\n` +
    `Client: ${client ? client.name : 'N/A'}\n` +
    `Status: ${caseDoc.status}\n` +
    `Priority: ${caseDoc.priority}\n` +
    `Deadline: ${caseDoc.deadline ? new Date(caseDoc.deadline).toDateString() : 'N/A'}\n` +
    `Open Tasks: ${openTasksCount}\n` +
    `Missing Documents: ${missingDocList}\n` +
    `Risk Level: ${riskLevel}`
  );
}

module.exports = { buildCaseSummary, determineRiskLevel };

