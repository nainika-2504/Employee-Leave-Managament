/**
 * ELMS - Cross-Platform Automated API Test Suite
 * Run with: node run_api_tests.js [BASE_URL]
 * Example: node run_api_tests.js http://localhost:8085
 *          node run_api_tests.js https://employee-leave-managament.onrender.com
 */

const BASE_URL = process.argv[2] || 'http://localhost:8085';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

const tests = [
  {
    id: 'TC-01',
    name: 'POST /api/auth/login - Valid Employee Login',
    method: 'POST',
    endpoint: '/api/auth/login',
    body: { email: 'nainika@company.com', password: 'password' },
    expectedStatus: 200,
    validate: (res, data) => data.role === 'EMPLOYEE' && data.id != null
  },
  {
    id: 'TC-02',
    name: 'POST /api/auth/login - Invalid Credentials Rejection',
    method: 'POST',
    endpoint: '/api/auth/login',
    body: { email: 'fake@company.com', password: 'wrong' },
    expectedStatus: 400
  },
  {
    id: 'TC-03',
    name: 'GET /api/users - Fetch All Users List',
    method: 'GET',
    endpoint: '/api/users',
    expectedStatus: 200,
    validate: (res, data) => Array.isArray(data) && data.length > 0
  },
  {
    id: 'TC-04',
    name: 'GET /api/users/1/balances - Fetch Employee Quota Balances',
    method: 'GET',
    endpoint: '/api/users/1/balances',
    expectedStatus: 200,
    validate: (res, data) => data.ANNUAL && data.SICK && data.CASUAL
  },
  {
    id: 'TC-05',
    name: 'GET /api/users/all-balances - Fetch Department Balance Matrix',
    method: 'GET',
    endpoint: '/api/users/all-balances',
    expectedStatus: 200,
    validate: (res, data) => typeof data === 'object' && Object.keys(data).length > 0
  },
  {
    id: 'TC-06',
    name: 'GET /api/leaves - Filter Leaves for Employee (Role Isolation)',
    method: 'GET',
    endpoint: '/api/leaves?userId=1&role=EMPLOYEE',
    expectedStatus: 200,
    validate: (res, data) => Array.isArray(data)
  },
  {
    id: 'TC-07',
    name: 'GET /api/leaves - Filter Leaves for Manager View',
    method: 'GET',
    endpoint: '/api/leaves?role=MANAGER',
    expectedStatus: 200,
    validate: (res, data) => Array.isArray(data)
  },
  {
    id: 'TC-08',
    name: 'POST /api/leaves - Reject Request Exceeding Remaining Quota',
    method: 'POST',
    endpoint: '/api/leaves?queryUserId=1',
    body: {
      leaveType: 'CASUAL',
      startDate: '2026-11-01',
      endDate: '2026-11-20',
      daysCount: 50,
      reason: 'Testing quota boundary enforcement'
    },
    expectedStatus: 400
  }
];

async function runTests() {
  console.log(`${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.cyan}   EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS) - API TEST RUNNER     ${colors.reset}`);
  console.log(`${colors.yellow}   Target URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}=================================================================${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const start = Date.now();
    console.log(`${colors.white}[${t.id}] ${t.name}${colors.reset}`);
    console.log(`${colors.gray}       ${t.method} ${BASE_URL}${t.endpoint}${colors.reset}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const options = {
        method: t.method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      };
      if (t.body) {
        options.body = JSON.stringify(t.body);
      }

      const res = await fetch(`${BASE_URL}${t.endpoint}`, options);
      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;
      const data = await res.json().catch(() => ({}));

      const statusMatch = res.status === t.expectedStatus;
      let customMatch = true;
      if (t.validate && statusMatch) {
        customMatch = t.validate(res, data);
      }

      if (statusMatch && customMatch) {
        console.log(`${colors.green}       [PASS] Status: ${res.status} (${elapsed}ms)${colors.reset}\n`);
        passed++;
      } else {
        console.log(`${colors.red}       [FAIL] Got HTTP ${res.status} (Expected: ${t.expectedStatus})${colors.reset}\n`);
        failed++;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.log(`${colors.red}       [ERROR] Request failed: ${err.message}${colors.reset}\n`);
      failed++;
    }
  }

  const total = passed + failed;
  const pct = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log(`${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.cyan}                      TEST RESULTS SUMMARY                       ${colors.reset}`);
  console.log(`${colors.cyan}=================================================================${colors.reset}`);
  console.log(`   Total Tests Executed : ${total}`);
  console.log(`${colors.green}   Tests Passed         : ${passed}${colors.reset}`);
  console.log(`${failed > 0 ? colors.red : colors.green}   Tests Failed         : ${failed}${colors.reset}`);
  console.log(`${colors.yellow}   Pass Rate            : ${pct}%${colors.reset}`);
  console.log(`${colors.cyan}=================================================================${colors.reset}\n`);
}

runTests();
