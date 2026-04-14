import "dotenv/config";
import Admin from "../models/Admin";
import connectDB from "../config/db";

async function main() {
  await connectDB();

  const admin = await Admin.create({
    name: "Super Admin",
    email: "admin@longsong.mn",
    password: "superadmin123", // pre('save') hook bcrypt-ээр hash хийнэ
    role: "superadmin",
  });

  console.log("Admin үүслээ:", admin.email);
  process.exit(0);
}

main().catch(console.error);
