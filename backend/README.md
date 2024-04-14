MAUGRAS Alexandre
node server.js

curl -X POST \
  http://localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "unicorn",
    "password": "unicorn"
}'
curl -X POST \
  http://localhost:3001/auth/login \   
  -H 'Content-Type: application/json' \
  -d '{
    "username": "unicorn",
    "password": "unicorn"
}'

curl -X POST \
  http://localhost:3001/passwords \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNjY2MiLCJpYXQiOjE3MTI3NDExMzR9.txw61dHNNC1w9YxehKiCvC1DhPEbj7LuTJgqSuNjssc' \
  -H 'Content-Type: application/json' \
  -d '{
    "generateStrongPassword": false,
    "username": "nouvel_utilisateur",
    "password": "mot_de_passe",
    "website": "https://exemple.com"
}'


curl -X POST \
  http://localhost:3001/passwords \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNjY2MiLCJpYXQiOjE3MTI3NDExMzR9.txw61dHNNC1w9YxehKiCvC1DhPEbj7LuTJgqSuNjssc' \
  -H 'Content-Type: application/json' \
  -d '{
    "generateStrongPassword": true,
    "passwordLength": 16,
    "includeNumbers": true,
    "includeSpecialChars": true,
    "username": "aaaaaa",
    "password": "bbbbb",
    "website": "dddddddddle.com"
}
'




curl -X PUT \
  http://localhost:3001/passwords/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNjY2MiLCJpYXQiOjE3MTI3NDExMzR9.txw61dHNNC1w9YxehKiCvC1DhPEbj7LuTJgqSuNjssc' \
  -H 'Content-Type: application/json' \
  -d '{
    "useStrongPassword": true,
    "passwordLength": 16,
    "includeNumbers": true,
    "includeSpecialChars": true,
    "username": "nouveau_nom_utilisateur",
    "website": "example.com"
  }'
