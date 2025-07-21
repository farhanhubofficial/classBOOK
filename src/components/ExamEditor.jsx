// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import { db } from "../firebase-config";
// import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
// import {
//   useEditor,
//   EditorContent,
// } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { TextStyle } from "@tiptap/extension-text-style";
// import { Color } from "@tiptap/extension-color";
// import { Highlight } from "@tiptap/extension-highlight";
// import { FontFamily } from "@tiptap/extension-font-family";
// import { FontSize } from "@tiptap/extension-font-size";
// import TextAlign from "@tiptap/extension-text-align";

// const ExamEditor = ({ onClose, initialContent = "", examId = null }) => {
//   const { curriculum, grade, subject } = useParams();
//   const [content, setContent] = useState(initialContent);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       TextStyle,
//       Color,
//       Highlight,
//       FontFamily.configure({ types: ['textStyle'] }),
//       FontSize.configure({ types: ['textStyle'] }),
//       TextAlign.configure({ types: ['heading', 'paragraph'] }),
//     ],
//     content: initialContent,
//     editorProps: {
//       attributes: {
//         class: "min-h-[400px] p-3 border border-gray-300 rounded focus:outline-none",
//       },
//     },
//     onUpdate: ({ editor }) => {
//       setContent(editor.getHTML());
//     },
//   });

//   const handleSave = async () => {
//     try {
//       const examsRef = collection(db, curriculum, grade, "subjects", subject, "exams");

//       if (examId) {
//         const examDocRef = doc(examsRef, examId);
//         await updateDoc(examDocRef, {
//           content,
//           updatedAt: new Date(),
//         });
//         alert("Exam updated successfully!");
//       } else {
//         await addDoc(examsRef, {
//           content,
//           createdAt: new Date(),
//         });
//         alert("Exam saved successfully!");
//       }

//       if (editor) {
//         editor.commands.clearContent();
//       }

//       if (onClose) onClose();
//     } catch (err) {
//       console.error("Error saving exam:", err);
//       alert("Failed to save exam.");
//     }
//   };

//   const applyColor = (color) => {
//     editor.chain().focus().setColor(color).run();
//   };

//   const applyBgColor = (color) => {
//     editor.chain().focus().setHighlight({ color }).run();
//   };

//   return (
//     <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
//         {examId ? "📝 Edit Exam" : "📝 Exam Creator"}
//       </h2>

//       {/* Toolbar */}
//       {editor && (
//         <div className="flex flex-wrap gap-2 mb-4">
//           <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">Bold</button>
//           <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">Italic</button>
//           <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn">Underline</button>
//           <button onClick={() => editor.chain().focus().toggleStrike().run()} className="btn">Strike</button>
//           <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">• List</button>
//           <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn">1. List</button>
//           <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="btn">Left</button>
//           <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="btn">Center</button>
//           <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="btn">Right</button>
//           <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="btn">Clear</button>
//           <input type="color" onChange={(e) => applyColor(e.target.value)} title="Text Color" />
//           <input type="color" onChange={(e) => applyBgColor(e.target.value)} title="Background" />
//           <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>
//             <option value="">Font</option>
//             <option value="Arial">Arial</option>
//             <option value="Georgia">Georgia</option>
//             <option value="Tahoma">Tahoma</option>
//             <option value="Courier New">Courier New</option>
//           </select>
//           <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}>
//             <option value="">Size</option>
//             <option value="12px">12px</option>
//             <option value="16px">16px</option>
//             <option value="20px">20px</option>
//             <option value="24px">24px</option>
//           </select>
//         </div>
//       )}

//       {/* Editor Area */}
//       <div className="border rounded min-h-[400px]">
//         <EditorContent editor={editor} />
//       </div>

//       {/* Actions */}
//       <div className="flex justify-end gap-2 mt-4">
//         <button
//           onClick={onClose}
//           className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSave}
//           className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
//         >
//           💾 Save Exam
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ExamEditor;
