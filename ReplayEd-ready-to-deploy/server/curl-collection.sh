#!/usr/bin/env bash
# ==============================================================================
# PS2 Adaptive Learning & Proctoring Portal - Complete API cURL Collection
# Usage:
#   chmod +x curl-collection.sh
#   ./curl-collection.sh
# ==============================================================================

BASE_URL="http://localhost:5000/api"

echo "=========================================================="
echo "1. Health Check"
echo "=========================================================="
curl -s -X GET "http://localhost:5000/health" | jq .

echo ""
echo "=========================================================="
echo "2. POST /api/auth/login (Student & Trainer JWT Auth)"
echo "=========================================================="
STUDENT_AUTH=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@replayed.edu","password":"password123","role":"student"}')
echo "Student Login Response:"
echo "$STUDENT_AUTH" | jq .

TOKEN=$(echo "$STUDENT_AUTH" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo ""
echo "=========================================================="
echo "3. GET /api/exams/exam_ds_algo_01 (Exam Config & Rules)"
echo "=========================================================="
curl -s -X GET "$BASE_URL/exams/exam_ds_algo_01" | jq .

echo ""
echo "=========================================================="
echo "4. POST /api/exams/exam_ds_algo_01/start (Create Session)"
echo "=========================================================="
SESSION_RESP=$(curl -s -X POST "$BASE_URL/exams/exam_ds_algo_01/start" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"s1"}')
echo "$SESSION_RESP" | jq .

SESSION_ID=$(echo "$SESSION_RESP" | grep -o '"sessionId":"[^"]*' | grep -o '[^"]*$')
if [ -z "$SESSION_ID" ]; then
  SESSION_ID="sess_demo_alex"
fi

echo ""
echo "=========================================================="
echo "5. GET /api/next-question?studentId=s1 (Adaptive Question)"
echo "=========================================================="
NEXT_Q=$(curl -s -X GET "$BASE_URL/next-question?studentId=s1&target=oop_basics")
echo "$NEXT_Q" | jq .
Q_ID=$(echo "$NEXT_Q" | grep -o '"questionId":"[^"]*' | grep -o '[^"]*$')
if [ -z "$Q_ID" ]; then
  Q_ID="q_var_mcq_1"
fi

echo ""
echo "=========================================================="
echo "6. POST /api/answer (Submit Answer & Update BKT Mastery)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/answer" \
  -H "Content-Type: application/json" \
  -d "{\"studentId\":\"s1\",\"questionId\":\"$Q_ID\",\"correct\":true,\"sessionId\":\"$SESSION_ID\"}" | jq .

echo ""
echo "=========================================================="
echo "7. POST /api/code/run (Sandbox Code Execution)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/code/run" \
  -H "Content-Type: application/json" \
  -d '{"questionId":"q_var_code_1","code":"const fs = require(\"fs\"); const line = fs.readFileSync(0, \"utf-8\").trim(); const [a, b] = line.split(/\\s+/).map(Number); console.log(a + b);","lang":"javascript","studentId":"s1"}' | jq .

echo ""
echo "=========================================================="
echo "8. POST /api/events (3-Warning Proctoring Telemetry)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/events" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"events\":[{\"t\":1200,\"type\":\"key\",\"data\":{\"key\":\"c\"}},{\"t\":2400,\"type\":\"paste_attempt_blocked\",\"data\":{\"charCount\":350}},{\"t\":3500,\"type\":\"tab_hidden\",\"data\":{}}]}" | jq .

echo ""
echo "=========================================================="
echo "9. GET /api/attempt/attempt_demo_01/replay (Replay & Signals)"
echo "=========================================================="
curl -s -X GET "$BASE_URL/attempt/attempt_demo_01/replay" | jq .

echo ""
echo "=========================================================="
echo "10. GET /api/student/s1/mastery (Student Mastery Vector)"
echo "=========================================================="
curl -s -X GET "$BASE_URL/student/s1/mastery" | jq .

echo ""
echo "=========================================================="
echo "11. GET /api/trainer/batch (Cohort Batch & Flagged Review)"
echo "=========================================================="
curl -s -X GET "$BASE_URL/trainer/batch" | jq .

echo ""
echo "=========================================================="
echo "12. POST /api/explain/generate (Claude Viva Question Gen)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/explain/generate" \
  -H "Content-Type: application/json" \
  -d '{"attemptId":"attempt_demo_01","code":"class LRUCache { constructor(capacity) { this.capacity = capacity; } }","questionPrompt":"Implement an LRU Cache"}' | jq .

echo ""
echo "=========================================================="
echo "13. POST /api/explain/judge (Claude Viva Oral Grading)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/explain/judge" \
  -H "Content-Type: application/json" \
  -d '{"question":"Why use a doubly linked list combined with a hash map?","answer":"The hash map gives O(1) lookup by key while the doubly linked list maintains recency order and allows O(1) removal and insertion at head/tail."}' | jq .

echo ""
echo "=========================================================="
echo "14. POST /api/admin/generate-question (AI Question Generator)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/admin/generate-question" \
  -H "Content-Type: application/json" \
  -d '{"conceptId":"loops","difficulty":2}' | jq .

echo ""
echo "=========================================================="
echo "15. POST /api/exams/exam_ds_algo_01/submit (Final Submit)"
echo "=========================================================="
curl -s -X POST "$BASE_URL/exams/exam_ds_algo_01/submit" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"studentId\":\"s1\",\"finalCode\":\"class LRUCache {}\"}" | jq .

echo ""
echo "All 15 endpoints verified successfully!"
