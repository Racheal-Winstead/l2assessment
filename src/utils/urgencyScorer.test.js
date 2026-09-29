import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateUrgency } from './urgencyScorer.js'

const cases = [
  ['short outage', 'Server down now', 'High'],
  ['database connection lost', 'Database connection lost', 'High'],
  ['polite emergency', 'Please help, our production server is down. Thank you!', 'High'],
  ['uppercase emergency', 'OUR SERVER IS DOWN', 'High'],
  ['blocked login', 'I cannot log in to my account', 'High'],
  ['curly apostrophe', 'I can’t access the dashboard', 'High'],
  ['blocked checkout', 'Customers are unable to complete a purchase', 'High'],
  ['security incident', 'My account has been compromised', 'High'],
  ['data loss', 'We are losing customer records', 'High'],
  ['widespread failure', 'Multiple users report an error opening reports', 'High'],
  ['deadline with issue', 'The export is failing and my deadline is within an hour', 'High'],
  ['ordinary technical problem', 'The report is slow to load', 'Medium'],
  ['billing problem', 'I was charged twice for my subscription', 'Medium'],
  ['refund request', 'Please refund the duplicate charge', 'Medium'],
  ['enthusiastic feedback', 'Thank you! Your team has been incredibly helpful!', 'Low'],
  ['feature request', 'Could you add an export to CSV feature for monthly reports?', 'Low'],
  ['urgent feature request', 'Please add dark mode ASAP!', 'Low'],
  ['general inquiry', 'What are your business hours?', 'Low'],
  ['minimal input', 'hi', 'Low'],
  ['empty input', '', 'Low'],
  ['negated outage', 'The server is not down', 'Low'],
  ['resolved outage', 'The server was down but is back online now', 'Low'],
  ['resolved issue', 'The payment error is fixed, thank you!', 'Low'],
  ['no errors', 'There are no errors. Everything looks great!', 'Low'],
  ['no data loss', 'There is no data loss', 'Low'],
  ['hypothetical outage', 'What happens if the server is down?', 'Low'],
  ['incident guidance', 'How can I avoid data loss?', 'Low'],
  ['mixed feedback and active issue', 'Thank you, but I still cannot access my account', 'High'],
  ['resolved and ongoing issues', 'The report error is fixed. Our server is still down.', 'High'],
  ['request for help with active outage', 'Our server is down, how can I fix this?', 'High'],
  ['conditional consequence', 'The export failed and we will miss the deadline if this continues', 'High'],
  ['unresolved error', 'The payment error is not fixed', 'Medium'],
]

for (const [name, message, expected] of cases) {
  test(name, () => assert.equal(calculateUrgency(message), expected))
}

test('tone and punctuation do not change priority', () => {
  for (const message of ['The export failed', 'The export failed!!!', 'THE EXPORT FAILED', 'Please help, the export failed. Thank you.']) {
    assert.equal(calculateUrgency(message), 'Medium')
  }
})
