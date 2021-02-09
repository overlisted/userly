# Signing up process
Here's a simple diagram of how it works:

```
     +-----------------------+            +-------+
     | Unverified Users      |            | Users |
     +-----------------------+            +-------+
       /|\                |                  /|\
        |                \|/                  |
POST /auth/signup   POST /auth/signup/verifyEmail  
        |                /|\
       \|/                | 
     +-----------------------+
     | Verification tickets  |
     +-----------------------+
```
