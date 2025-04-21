### url api
- http://localhost:5000/api/auth/register
- http://localhost:5000/api/auth/login
- http://localhost:5000/api/auth/profile
- http://localhost:5000/api/auth/change-password
- http://localhost:5000/api/auth/change-profile
- http://localhost:5000/api/exercises?type=1
- http://localhost:5000/api/exercises/1?type=1
- http://localhost:5000/api/student/rankings
- http://localhost:5000/api/auth/forgot-password
- http://localhost:5000/api/auth/reset-password
- http://localhost:5000/api/student/submit/multiple-choice
### tạo file .env chứa các biến môi trường
# app
- PORT = 5000
- JWT_SECRET=b21dccn721
- JWT_EXPIRES_IN=7d

# database
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=123456
- DB_NAME=btl_mad
# gg
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REFRESH_TOKEN
- EMAIL_FROM