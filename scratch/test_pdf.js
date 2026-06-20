import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

console.log("jsPDF:", typeof jsPDF);
console.log("autoTable:", typeof autoTable);

const doc = new jsPDF();
try {
  autoTable(doc, {
    head: [['Name', 'Age']],
    body: [['Alice', 20], ['Bob', 25]],
  });
  console.log("✅ autoTable call succeeded!");
  console.log("lastAutoTable finalY:", doc.lastAutoTable ? doc.lastAutoTable.finalY : "undefined");
} catch (e) {
  console.error("❌ autoTable call failed:", e.message);
}
