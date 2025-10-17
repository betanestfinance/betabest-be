import FinanceAnswer from "../models/FinanceAnswer.js";
import User from "../models/userModel.js";
import { sendMail } from "../utils/mailer.js";

// Common validation helper
const validateFinanceAnswers = (answers) => {
  if (!answers.age || answers.age <= 0) {
    return "Age must be greater than 0";
  }

  const requiredFields = [
    "investmentHorizon",
    "primaryIncome",
    "incomeStability",
    "savingPercentage",
    "cashReserves",
    "dependents",
    "experience",
    "reactionToLoss",
    "maxDeclineTolerance",
    "moneyView",
    "investmentGoal",
    "expectedReturn",
  ];

  for (const field of requiredFields) {
    if (!answers[field]) {
      return `${field} is required`;
    }
  }

  return null; // no errors
};

function computeRiskProfile(answers = {}) {
  const a = (v) => (v === undefined || v === null ? "" : String(v).toLowerCase().trim());

  // 1. Age
  const scoreAge = (ageRaw) => {
    const age = Number(ageRaw);
    if (Number.isNaN(age)) return 0;
    if (age >= 50) return 1;
    if (age >= 35) return 2;
    if (age >= 26) return 3;
    if (age >= 18) return 4;
    if (age < 18) return 5;
    return 0;
  };

  // 2. Investment Horizon
  const scoreHorizon = (h) => {
    const s = a(h);
    if (s.includes("<1") || s.includes("less than 1") || s.includes("short")) return 1;
    if (s.includes("1") && s.includes("3") || /1\s*[-–]\s*3|1–3|1-3/.test(s)) return 2;
    if (s.includes("3") && s.includes("5") || /3\s*[-–]\s*5|3–5|3-5/.test(s)) return 3;
    if (s.includes("5") && s.includes("10") || /5\s*[-–]\s*10|5–10|5-10/.test(s)) return 4;
    if (s.includes("10") || s.includes("10+")) return 5;
    // fallback attempts:
    if (s.match(/\d+/)) {
      const n = Number(s.match(/\d+/)[0]);
      if (n <= 1) return 1;
      if (n <= 3) return 2;
      if (n <= 5) return 3;
      if (n <= 10) return 4;
      return 5;
    }
    return 0;
  };

  // 3. Primary source of income
  const scorePrimaryIncome = (v) => {
    const s = a(v);
    if (!s) return 0;
    if (s.includes("fixed") || s.includes("govt") || s.includes("government") || s.includes("corporate")) return 5;
    if (s.includes("business")) return 3;
    if (s.includes("self") || s.includes("freelance") || s.includes("professional")) return 4;
    if (s.includes("passive") || s.includes("rental") || s.includes("dividend")) return 3.5;
    if (s.includes("retired")) return 4;
    if (s.includes("other") || s.includes("inheritance") || s.includes("trust") || s.includes("family office")) return 2;
    return 0;
  };

  // 4. incomeStability
  const scoreIncomeStability = (v) => {
    const s = a(v);
    if (s.includes("very")) return 5;
    if (s.includes("moderate") || s.includes("moderately")) return 3;
    if (s.includes("high") || s.includes("variable") || s.includes("uncertain")) return 1.5;
    return 0;
  };

  // 5. savingPercentage
  const scoreSaving = (v) => {
    const s = a(v);
    if (!s) return 0;
    if (s.includes("<") || s.includes("less") || s.includes("below")) {
      // <10 or less than 10
      if (s.match(/<\s*10|less.*10|below.*10/)) return 1;
    }
    if (s.includes("40") || s.includes("more than 40") || s.includes("above 40") || s.includes("50")) return 5;
    if (s.includes("25") || s.includes("25%") || s.includes("25 ")) return 4;
    if (s.includes("10") || s.includes("10%")) return 2;
    // fallback numeric parse
    const n = (s.match(/\d+/) && Number(s.match(/\d+/)[0])) || null;
    if (n !== null) {
      if (n < 10) return 1;
      if (n < 25) return 2;
      if (n < 40) return 4;
      return 5;
    }
    return 0;
  };

  // 6. dependents
  const scoreDependents = (v) => {
    const s = a(v);
    if (s.includes("5") || s.includes("more")) return 1;
    if (s.includes("3") || s.includes("3-4") || s.includes("3–4")) return 2;
    if (s.includes("1") || s.includes("1-2") || s.includes("1–2")) return 3;
    if (s.includes("none") || s === "0") return 5;
    return 0;
  };

  // 7. cashReserves
  const scoreCash = (v) => {
    const s = a(v);
    if (!s) return 0;
    if (s.includes("no") || s.includes("none")) return 1;
    if (s.includes("0") && s.includes("3") || /0\s*[-–]\s*3|0–3|0-3/.test(s) || s.includes("up to 3")) return 2;
    if (s.includes("3") && s.includes("6") || /3\s*[-–]\s*6|3–6|3-6/.test(s)) return 3;
    if (s.includes("6") || s.includes("more than 6") || s.includes("6+")) return 5;
    return 0;
  };

  // 8. experience
  const scoreExperience = (v) => {
    const s = a(v);
    if (s.includes("beginner")) return 1;
    if (s.includes("moderate") || s.includes("intermediate")) return 3;
    if (s.includes("experienced") || s.includes("advanced")) return 5;
    return 0;
  };

  // 9. reactionToLoss
  const scoreReaction = (v) => {
    const s = a(v);
    if (s.includes("exit") || s.includes("withdraw")) return 1;
    if (s.includes("reduce") || s.includes("wait")) return 2;
    if (s.includes("remain") || s.includes("hold")) return 4;
    if (s.includes("allocate") || s.includes("buy more") || s.includes("invest more")) return 5;
    return 0;
  };

  // 10. maxDeclineTolerance
  const scoreMaxDecline = (v) => {
    const s = a(v);
    if (s.includes("5%") || s.includes("up to 5")) return 1;
    if (s.includes("10%") || s.includes("up to 10")) return 2;
    if (s.includes("20%") || s.includes("up to 20")) return 3;
    if (s.includes("30") || s.includes("30%") || s.includes("more")) return 5;
    return 0;
  };

  // 11 Money view
  const scoreMoneyView = (v) => {
    const s = a(v);
    if (s.includes("security")) return 1;
    if (s.includes("aggressive") || s.includes("opportunity")) return 3;
    if (s.includes("balanced")) return 5;
    return 0;
  };

  // 12 Investment goal
  const scoreGoal = (v) => {
    const s = a(v);
    if (s.includes("wealth") && s.includes("creation")) return 1;
    if (s.includes("retirement")) return 2;
    if (s.includes("child")) return 3;
    if (s.includes("tax")) return 4;
    if (s.includes("legacy") || s.includes("succession")) return 5;
    return 0;
  };

  // 13 Expected return
  const scoreExpectedReturn = (v) => {
    const s = a(v);
    if (s.includes("below") || s.includes("<6") || s.includes("below 6") || s.includes("< 6")) return 1;
    if (s.includes("6") && s.includes("10") || /6\s*[-–]\s*10|6–10|6-10/.test(s)) return 2;
    if (s.includes("10") && s.includes("15") || /10\s*[-–]\s*15|10–15|10-15/.test(s)) return 3;
    if (s.includes("15") || s.includes("above 15") || s.includes(">15") || s.includes("15%+")) return 5;
    // fallback numeric
    const num = s.match(/\d+/);
    if (num) {
      const n = Number(num[0]);
      if (n < 6) return 1;
      if (n < 10) return 2;
      if (n < 15) return 3;
      return 5;
    }
    return 0;
  };

  // 14 Major events
  const scoreMajorEvents = (v) => {
    const s = a(v);
    if (!s) return 0;
    if (s.includes("purchase") || s.includes("property") || s.includes("house")) return 1;
    if (s.includes("child") || s.includes("education")) return 2;
    if (s.includes("marriage")) return 3;
    if (s.includes("retire")) return 3;
    if (s.includes("business")) return 4;
    if (s.includes("none") || s.includes("no")) return 5;
    return 0;
  };

  // helper to pick first item if array
  const pick = (field) => {
    const val = answers[field];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  let total = 0;
  total += scoreAge(pick("age"));
  total += scoreHorizon(pick("investmentHorizon"));
  total += scorePrimaryIncome(pick("primaryIncome"));
  total += scoreIncomeStability(pick("incomeStability"));
  total += scoreSaving(pick("savingPercentage") || pick("savingPercentage") || pick("savingPercentage"));
  total += scoreDependents(pick("dependents"));
  total += scoreCash(pick("cashReserves"));
  total += scoreExperience(pick("experience"));
  total += scoreReaction(pick("reactionToLoss") || pick("reaction15") || pick("reaction15"));
  total += scoreMaxDecline(pick("maxDeclineTolerance") || pick("maxDecline"));
  total += scoreMoneyView(pick("moneyView"));
  total += scoreGoal(pick("investmentGoal") || pick("goal"));
  total += scoreExpectedReturn(pick("expectedReturn"));
  // majorEvents could be array or single
  const majorVal = Array.isArray(answers.majorEvents) ? answers.majorEvents[0] : answers.majorEvents;
  total += scoreMajorEvents(majorVal);

  const rounded = Math.round(total);

  // determine profile
  let profile = "Conservative";
  if (rounded >= 15 && rounded <= 25) profile = "Conservative";
  else if (rounded >= 26 && rounded <= 40) profile = "Balanced";
  else if (rounded >= 41 && rounded <= 55) profile = "Growth";
  else if (rounded >= 56) profile = "Aggressive";
  else profile = "Conservative";

  return { score: rounded, profile };
}


// Save finance answers
export const saveFinanceAnswers = async (req, res) => {
  try {
    const userId = req.body.user || "";
    const userEmail = req.body.email || "";

    if (!userEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const answers = req.body;

    // If you have an existing validator function, keep using it.
    // If not, remove this call or replace with your own logic.
    if (typeof validateFinanceAnswers === "function") {
      const validationError = validateFinanceAnswers(answers);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
    }

    // Prevent duplicate entry
    let existing = await FinanceAnswer.findOne({ email: userEmail, isActive: true });
    if (existing) {
      return res.status(400).json({ message: "Answers already exist" });
    }

    // compute risk profile
    const { score, profile } = computeRiskProfile(answers);

    // create FinanceAnswer doc
    let newAnswers;
    console.log("userId in saveFinanceAnswers:", userId);
    if (userId) {
      newAnswers = new FinanceAnswer({ user: userId, riskProfile: profile, riskScore: score, ...answers });
      try {
        await User.findByIdAndUpdate(
          userId,
          { $set: { riskProfile: profile, riskScore: score, isFinanceSubmitted: true }},
          { new: true }
        );
      } catch (uErr) {
        console.error("Failed to update user RiskProfile:", uErr);
      }
    } else {
      newAnswers = new FinanceAnswer({ ...answers });
    }

    // attach computed profile info into the finance answers doc as well (optional)
    newAnswers.riskScore = score;
    newAnswers.riskProfile = profile;

    await newAnswers.save();

    // If user exists, update the user model with RiskProfile (and numeric score)
    // console.log("userId", userId)
    // if (userId) {
    //   try {
    //     await User.findByIdAndUpdate(
    //       userId,
    //       { riskProfile: profile, riskScore: score },
    //       { new: true }
    //     );
    //   } catch (uErr) {
    //     console.error("Failed to update user RiskProfile:", uErr);
    //   }
    // }

    await sendMail(
      userEmail,
      "BetaNest - Risk profile assessment",
      `<p>Hello</p>
        <p>As per your answers to investment profile analysis, your risk profile is ${profile}. You will soon receive a mail from us for the next step. Meanwhile you can book a 30 minutes meeting from below link</p>
        <p><a href="https://calendly.com/betanestfinance" target="_blank">Book a meeting</a></p><br/>
        <p>Best Regards,<br/>BetaNest Team</p>
        `
    );

    res.status(201).json({ message: "Finance answers saved", data: newAnswers, risk: { score, profile } });
  } catch (err) {
    console.error("Save finance answers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get finance answers by user
export const getFinanceAnswers = async (req, res) => {
  try {
    // console.log("User in getFinanceAnswers:", req.user);
    const userId = req.user.id;
    const answers = await FinanceAnswer.find({ user: userId }).populate("user", "name email");
    if (!answers) return res.status(404).json({ message: "No answers found" });

    res.json(answers);
  } catch (err) {
    console.error("Get finance answers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update finance answers
export const updateFinanceAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate input
    const validationError = validateFinanceAnswers(updates);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updated = await FinanceAnswer.findOneAndUpdate(
      { user: userId },
      { ...updates },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "No answers found" });

    res.json({ message: "Finance answers updated", data: updated });
  } catch (err) {
    console.error("Update finance answers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
