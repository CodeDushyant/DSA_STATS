const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

const USERNAME = "Prime_Runner";
const CODEFORCES = "Prime_Runner";

async function getLeetCode() {
  try {
    const query = `
      query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const { data } = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: {
        username: USERNAME,
      },
    });

    const stats = data.data.matchedUser.submitStats.acSubmissionNum;

    return {
      easy: stats[1].count,
      medium: stats[2].count,
      hard: stats[3].count,
      total: stats[0].count,
    };
  } catch {
    return {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
    };
  }
}

async function getCodeforces() {
  try {
    const { data } = await axios.get(
      `https://codeforces.com/api/user.status?handle=${CODEFORCES}`,
    );

    const solved = new Set();

    data.result.forEach((sub) => {
      if (sub.verdict === "OK") {
        solved.add(sub.problem.contestId + "-" + sub.problem.index);
      }
    });

    return solved.size;
  } catch {
    return 0;
  }
}

// Helper Function
async function getAllStats() {
  const leetcode = await getLeetCode();
  const codeforces = await getCodeforces();

  const gfg = 0;
  const codechef = 0;
  const codingNinjas = 0;

  const total = leetcode.total + codeforces + gfg + codechef + codingNinjas;

  return {
    total,
    leetcode,
    codeforces,
    gfg,
    codechef,
    codingNinjas,
  };
}

// Full Stats
app.get("/api/stats", async (req, res) => {
  const stats = await getAllStats();
  res.json(stats);
});

// Only Total Solved
app.get("/api/total", async (req, res) => {
  const stats = await getAllStats();

  res.json({
    totalSolved: stats.total,
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
