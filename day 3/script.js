let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const categories = ["personal", "work", "study"];

function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest
  );
}

function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };

  for (const note of notes) {
    counts[note.category] += 1;
  }

  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const noteWord = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${noteWord}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

function isDuplicate(text) {
  const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedText = normalize(text);

  return notes.some((note) => normalize(note.text) === normalizedText);
}

function addNote(text, category) {
  if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 200) {
    console.log("Note rejected: text must be 1-200 characters.");
    return false;
  }

  const cleanedText = text.trim();

  if (isDuplicate(cleanedText)) {
    console.log("Note rejected: a note with the same text already exists.");
    return false;
  }

  if (!categories.includes(category)) {
    console.log("Note rejected: category must be personal, work, or study.");
    return false;
  }

  const nextId = notes.reduce((highestId, note) => Math.max(highestId, note.id), 0) + 1;
  notes.push({ id: nextId, text: cleanedText, category });
  console.log(`Note added: "${cleanedText}" (${category}).`);
  return true;
}

// Function tests (the comments show the expected console output).
console.log(searchNotes("JAVASCRIPT").map((note) => note.text)); // Expected: ["Revise JavaScript arrays"]
console.log(searchNotes("missing").map((note) => note.text)); // Expected: []

console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
const savedNotes = notes;
notes = [];
console.log(longestNote()); // Expected: null
console.log(countByCategory()); // Expected: { personal: 0, work: 0, study: 0 }
console.log(getSummary()); // Expected: "0 notes: 0 personal, 0 work, 0 study."
notes = savedNotes;

console.log(countByCategory()); // Expected: { personal: 2, work: 1, study: 2 }
console.log(getSummary()); // Expected: "5 notes: 2 personal, 1 work, 2 study."
const originalNotes = notes;
notes = [notes[4]];
console.log(getSummary()); // Expected: "1 note: 1 personal, 0 work, 0 study."
notes = originalNotes;

console.log(isDuplicate("  BUY   milk and bread ")); // Expected: true
console.log(isDuplicate("Write a new idea")); // Expected: false

console.log(addNote("Plan weekend", "personal")); // Expected: logs added message, then true
console.log(addNote(" plan   WEEKEND ", "work")); // Expected: logs duplicate reason, then false
console.log(addNote("   ", "study")); // Expected: logs invalid text reason, then false
console.log(addNote("A valid note", "other")); // Expected: logs invalid category reason, then false
