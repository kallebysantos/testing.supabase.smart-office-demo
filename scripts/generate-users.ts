#!/usr/bin/env tsx

/**
 * Users Generator
 *
 * Generates user profiles directly in Supabase with fantasy names
 * and realistic roles/departments for law firm demo
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

// Load environment variables
config({ path: ".env.local" });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TOTAL_USERS = 10; // Start with just 10 for testing

console.log("🔧 Environment check:");
console.log(
  "   SUPABASE_URL:",
  SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : "NOT SET"
);
console.log(
  "   SERVICE_KEY:",
  SUPABASE_SERVICE_KEY
    ? `${SUPABASE_SERVICE_KEY.substring(0, 20)}...`
    : "NOT SET"
);

if (!SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL environment variable is required");
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}

console.log("🏗️ Creating Supabase client...");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fantasy names from various universes
const FIRST_NAMES = [
  // Harry Potter
  "Hermione",
  "Luna",
  "Ginny",
  "Lily",
  "Molly",
  "Minerva",
  "Nymphadora",
  "Bellatrix",
  "Harry",
  "Ron",
  "Neville",
  "Draco",
  "Severus",
  "Albus",
  "Sirius",
  "Remus",
  "Arthur",
  "Fred",
  "George",
  "Percy",
  "Bill",
  "Charlie",
  "Cedric",

  // Star Wars
  "Leia",
  "Padmé",
  "Rey",
  "Ahsoka",
  "Jyn",
  "Mon",
  "Hera",
  "Luke",
  "Han",
  "Obi-Wan",
  "Anakin",
  "Poe",
  "Finn",
  "Lando",

  // Lord of the Rings
  "Arwen",
  "Galadriel",
  "Eowyn",
  "Tauriel",
  "Aragorn",
  "Legolas",
  "Gimli",
  "Boromir",
  "Faramir",
  "Samwise",
  "Frodo",
];

const LAST_NAMES = [
  // Harry Potter
  "Granger",
  "Potter",
  "Weasley",
  "Lovegood",
  "Longbottom",
  "Malfoy",
  "Snape",
  "Dumbledore",
  "Black",
  "Lupin",
  "McGonagall",
  "Diggory",

  // Star Wars
  "Organa",
  "Amidala",
  "Skywalker",
  "Solo",
  "Kenobi",
  "Tano",
  "Erso",
  "Mothma",
  "Calrissian",
  "Dameron",
  "Andor",

  // Lord of the Rings
  "Evenstar",
  "Greenleaf",
  "Baggins",
  "Gamgee",
  "Brandybuck",
  "Took",
  "Elessar",
  "Undómiel",
];

const DEPARTMENTS = [
  "Corporate Law",
  "Litigation",
  "Real Estate",
  "Employment Law",
  "Intellectual Property",
  "Tax Law",
  "Family Law",
  "Criminal Defense",
  "Immigration",
  "Environmental Law",
  "Healthcare Law",
  "Securities",
  "Mergers & Acquisitions",
  "Banking & Finance",
  "Insurance Defense",
  "Personal Injury",
  "Estate Planning",
  "Compliance",
];

// Role distribution for law firm
const ROLE_DISTRIBUTION = {
  admin: 0.08, // 8% - 2 people
  facilities: 0.12, // 12% - 3 people
  employee: 0.8, // 80% - 20 people
};

/**
 * Get floor access based on role
 */
function getFloorAccess(role: string): number[] {
  switch (role) {
    case "admin":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All floors
    case "facilities":
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Most floors
    case "employee":
    default:
      // Random 2-4 floors for employees
      const numFloors = Math.floor(Math.random() * 3) + 2;
      const floors: number[] = [];
      while (floors.length < numFloors) {
        const floor = Math.floor(Math.random() * 12) + 1;
        if (!floors.includes(floor)) {
          floors.push(floor);
        }
      }
      return floors.sort((a, b) => a - b);
  }
}

/**
 * Generate and insert user profiles
 */
async function generateUsers() {
  console.log("👥 Generating user profiles directly in Supabase...\n");

  try {
    console.log("🔗 Testing Supabase connection...");

    // Test connection first with a simpler query
    const { data: testData, error: testError } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("❌ Supabase connection failed:", testError);
      console.error(
        "   Full error object:",
        JSON.stringify(testError, null, 2)
      );
      console.error("   Error code:", testError.code);
      console.error("   Error message:", testError.message);
      console.error("   Error details:", testError.details);
      console.error("   Error hint:", testError.hint);
      throw testError;
    }
    console.log(
      "✅ Supabase connection successful, existing users:",
      testData?.length || 0
    );

    console.log("🧹 Simple cleanup - deleting user_profiles directly...");

    // Just delete user_profiles directly (simple approach)
    const { error: deleteProfileError } = await supabase
      .from("user_profiles")
      .delete()
      .neq("email", "hermione.granger@deweycheathamhowe.com");

    if (deleteProfileError) {
      console.log(
        "⚠️  Could not clear user profiles:",
        deleteProfileError.message
      );
    } else {
      console.log("✅ Cleared user_profiles table (kept demo user)");
    }

    // Calculate role distribution
    console.log("📊 Calculating role distribution...");
    const adminCount = Math.floor(TOTAL_USERS * ROLE_DISTRIBUTION.admin);
    const facilitiesCount = Math.floor(
      TOTAL_USERS * ROLE_DISTRIBUTION.facilities
    );
    const employeeCount = TOTAL_USERS - adminCount - facilitiesCount;

    console.log(
      `📊 Generating: ${adminCount} admin, ${facilitiesCount} facilities, ${employeeCount} employees`
    );

    console.log("🎲 Creating role queue...");
    // Create role queue
    const roleQueue = [
      ...Array(adminCount).fill("admin"),
      ...Array(facilitiesCount).fill("facilities"),
      ...Array(employeeCount).fill("employee"),
    ];

    console.log("🔀 Shuffling roles...");
    // Shuffle roles
    for (let i = roleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleQueue[i], roleQueue[j]] = [roleQueue[j], roleQueue[i]];
    }

    console.log("👤 Generating user data...");
    // Generate users
    const usersToInsert = [];
    const usedEmails = new Set();

    for (let i = 0; i < TOTAL_USERS; i++) {
      if (i % 25 === 0) console.log(`   Progress: ${i + 1}/${TOTAL_USERS}...`);

      // Simple random selection - no complex logic
      const firstName =
        FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName =
        LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

      // Simple email generation with counter for uniqueness
      let email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${lastName
        .toLowerCase()
        .replace(/[^a-z]/g, "")}@deweycheathamhowe.com`;
      let counter = 1;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${lastName
          .toLowerCase()
          .replace(/[^a-z]/g, "")}${counter}@deweycheathamhowe.com`;
        counter++;
      }
      usedEmails.add(email);

      const role = roleQueue[i] as "admin" | "facilities" | "employee";
      const department =
        role === "facilities"
          ? "Facilities Management"
          : role === "admin"
          ? "Administration"
          : DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];

      usersToInsert.push({
        email,
        full_name: `${firstName} ${lastName}`,
        department,
        role,
        floor_access: getFloorAccess(role),
      });
    }

    console.log(`✅ Generated ${usersToInsert.length} user profiles`);
    console.log("💾 Starting database insertion...");

    // Create auth users and profiles one by one (proper Supabase Auth way)
    let insertedCount = 0;

    for (let i = 0; i < usersToInsert.length; i++) {
      const userData = usersToInsert[i];

      console.log(
        `🔄 Creating auth user ${i + 1}/${usersToInsert.length}: ${
          userData.full_name
        }`
      );

      try {
        // Step 1: Create auth user using Admin API
        const { data: authUser, error: authError } =
          await supabase.auth.admin.createUser({
            email: userData.email,
            password: "demo123!", // Demo password for all users
            email_confirm: true, // Skip email confirmation for demo
            user_metadata: {
              full_name: userData.full_name,
              role: userData.role,
              department: userData.department,
            },
          });

        if (authError) {
          console.error(
            `❌ Error creating auth user ${i + 1} (${userData.full_name}):`,
            authError.message
          );
          continue;
        }

        if (!authUser.user) {
          console.error(`❌ No auth user returned for ${userData.full_name}`);
          continue;
        }

        console.log(
          `✅ Created auth user: ${userData.full_name} (${authUser.user.id})`
        );

        // Step 2: Update the auto-created profile with our custom data
        // (The trigger already created a basic profile, we just need to update it)
        const profileUpdates = {
          full_name: userData.full_name,
          department: userData.department,
          role: userData.role,
          floor_access: userData.floor_access,
        };

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .update(profileUpdates)
          .eq("id", authUser.user.id)
          .select();

        if (profileError) {
          console.error(
            `❌ Error updating user profile ${i + 1} (${userData.full_name}):`,
            profileError.message
          );
          console.error(
            "   Profile error details:",
            JSON.stringify(profileError, null, 2)
          );
          // Clean up the auth user if profile update fails
          console.log(`   🧹 Cleaning up auth user ${authUser.user.id}`);
          await supabase.auth.admin.deleteUser(authUser.user.id);

          // Stop the process to investigate
          console.log(
            "❌ Stopping due to profile update error for investigation"
          );
          break;
        }

        insertedCount++;
        console.log(
          `✅ SUCCESS ${i + 1}/${usersToInsert.length}: ${
            userData.full_name
          } (${userData.role}) - Auth: ${authUser.user.id}`
        );

        // Brief pause between creations to avoid overwhelming the API
        console.log(`   ⏱️  Pausing 200ms before next user...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`❌ Exception creating user ${i + 1}:`, err);
        continue;
      }
    }

    console.log(`\n🎉 Successfully generated ${insertedCount} user profiles!`);

    // Show summary
    const { data: summary } = await supabase
      .from("user_profiles")
      .select("role, department");

    if (summary) {
      const byRole = summary.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      console.log("\n📊 Summary:");
      Object.entries(byRole).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`);
      });
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateUsers();
}

export { generateUsers };
