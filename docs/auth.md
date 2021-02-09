# Auth API
Just what this server is supposed to provide.

## `POST /auth/signup`
Use this to create a new account. It renders `verificationEmail.pug` with email verification ticket and sends the result
to the account's email. As soon as [`/auth/signup/verifyEmail`](#post-authsignupverifyemail) is called with that ticket,
the account will be created.

### Expected payload
```ts
interface SignupRequest {
  email: string;
  username: string;
  newPassword: string; 
  newPasswordRepeat: string
}
```

### Throws
Form errors #1, #3, #5, #6, #7, #8, #9 and #10 with status 400.

### Response
Empty JSON object (`{}`) on success

## `POST /auth/login`
Use this to get the session token of an account.

### Expected payload
```ts
interface LoginRequest {
  email: string;
  password: string; 
}
```

### Throws
Form errors #2 and #4 with status 400.

### Response
```ts
interface LoginResponse {
  token: string
}
```

## `PATCH /auth/changePassword`
An **authorized** endpoint that changes the password of the current user.

### Expected payload
```ts
interface ChangePasswordRequest {
  password: string; // the old password
  newPassword: string;
  newPasswordRepeat: string;
}
```

### Throws
Form errors #3, #4, #5 and #9 with status 400.

### Response
Empty JSON object (`{}`) on success

## `POST /auth/signup/verifyEmail`
This is the endpoint that actually registers users (takes them out of the **unverified 
list**).

### Expected payload
```ts
interface VerifyEmailRequest {
  ticket: string
}
```

### Throws
Form error #11 with status 400.

### Response
Empty JSON object (`{}`) on success

## `POST /auth/login/resetPassword`
Sends an email built from `passwordResetEmail.pug` to the specified address and adds the address with a new ticket to 
the "to be reset" list.

### Expected payload
```ts
interface ResetPasswordRequest {
    email: string
}
```

### Throws
Nothing; if the email doesn't exist, the reset confirmation just doesn't arrive.

### Response
Empty JSON object (`{}`) on success

## `POST /auth/login/resetPassword/confirm`
If the `ticket` is present in the "to be reset" list, changes the password of the user that opened it.

### Expected payload
```ts
interface ConfirmResetPasswordRequest {
  ticket: string;
  newPassword: string;
  newPasswordRepeat: string
}
```

### Throws
Form errors #3, #5, #9 and #11 with status 400.

### Response
Empty JSON object (`{}`) on success
