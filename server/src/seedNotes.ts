import { Note } from "./notes/noteModel.js";

const sampleNotes = [
  {
    title: "CS161 Graph Algorithms & Dynamic Programming Guide",
    description: "A concise guide to Dijkstra, Bellman-Ford, spanning trees, and classic dynamic programming problems.",
    subject: "Computer Science",
    courseCode: "CS161",
    university: "University of Moratuwa",
    tags: ["Algorithms", "Graphs", "Dynamic Programming", "Midterm Review"],
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "CS161_Algorithms_Guide.pdf",
    fileSize: "3.4 MB",
    fileType: "pdf",
    previewText: "Dijkstra's algorithm finds shortest paths with non-negative edge weights. Bellman-Ford also supports negative edges and can detect negative cycles.",
    authorName: "Nimal Perera",
    authorUniversity: "University of Moratuwa",
    upvotes: 18,
  },
  {
    title: "Cell Biology & Molecular Signaling Cheatsheet",
    description: "A revision summary of cell membranes, receptor tyrosine kinases, and common signaling pathways.",
    subject: "Biology",
    courseCode: "BIO7.012",
    university: "University of Colombo",
    tags: ["Biochemistry", "Cell Biology", "Diagrams"],
    fileUrl: "",
    fileName: "BIO7012_Signaling_Notes.pdf",
    fileSize: "2.1 MB",
    fileType: "pdf",
    previewText: "Ligand binding can induce receptor dimerization and cross-phosphorylation, activating downstream signaling cascades.",
    authorName: "Kavindi Silva",
    authorUniversity: "University of Colombo",
    upvotes: 12,
  },
  {
    title: "MATH51 Vector Analysis & Stokes Theorem",
    description: "Worked examples covering gradients, Lagrange multipliers, multiple integrals, divergence, and curl.",
    subject: "Mathematics",
    courseCode: "MATH51",
    university: "University of Moratuwa",
    tags: ["Calculus", "Exam Prep", "Vectors"],
    fileUrl: "",
    fileName: "MATH51_Vector_Analysis.pdf",
    fileSize: "1.8 MB",
    fileType: "pdf",
    previewText: "For constrained optimization, solve grad(f) = lambda grad(g) together with the constraint equation g(x,y,z) = c.",
    authorName: "Sajini Jayawardena",
    authorUniversity: "University of Moratuwa",
    upvotes: 14,
  },
  {
    title: "Intermediate Microeconomics: Game Theory",
    description: "Notes on Nash equilibrium, Cournot and Bertrand competition, and asymmetric information.",
    subject: "Economics",
    courseCode: "ECON100A",
    university: "University of Peradeniya",
    tags: ["Microeconomics", "Game Theory", "Midterm"],
    fileUrl: "",
    fileName: "ECON100A_Game_Theory.pdf",
    fileSize: "1.9 MB",
    fileType: "pdf",
    previewText: "A Nash equilibrium is a strategy profile where no player can improve their outcome by changing strategy alone.",
    authorName: "Dulanjan Fernando",
    authorUniversity: "University of Peradeniya",
    upvotes: 9,
  },
];

export async function seedNotesIfEmpty() {
  if (process.env.SEED_DEMO_DATA === "false") return;
  if (await Note.exists({})) return;
  await Note.insertMany(sampleNotes);
  console.info(`Inserted ${sampleNotes.length} sample notes into MongoDB.`);
}
