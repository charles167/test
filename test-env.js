require("dotenv").config();
console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("SIGNING_SECRET:", process.env.SIGNING_SECRET);
