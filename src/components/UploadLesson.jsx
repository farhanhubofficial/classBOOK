import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize } from "@tiptap/extension-font-size";
import TextAlign from "@tiptap/extension-text-align";

// ❌ remove these (StarterKit already includes them)
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import ListItem from "@tiptap/extension-list-item";

// ✅ Import icons for professional toolbar look
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
} from "lucide-react";

// ---------- Global Toolbar ----------
const GlobalToolbar = ({ activeEditor }) => {
  const run = (fn) => activeEditor && fn(activeEditor);

  const applyColor = (color) =>
    run((e) => e.chain().focus().setColor(color).run());
  const applyBgColor = (color) =>
    run((e) => e.chain().focus().setHighlight({ color }).run());

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 border-b pb-3 bg-gray-50 px-3 py-2 rounded-lg shadow-sm">
      <button
        onClick={() => run((e) => e.chain().focus().toggleBold().run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Bold"
      >
        <Bold size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().toggleItalic().run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Italic"
      >
        <Italic size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().toggleStrike().run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Strike"
      >
        <Strikethrough size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().toggleBulletList().run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().toggleOrderedList().run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().setTextAlign("left").run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Align Left"
      >
        <AlignLeft size={18} />
      </button>

      <button
        onClick={() =>
          run((e) => e.chain().focus().setTextAlign("center").run())
        }
        className="p-2 hover:bg-gray-200 rounded"
        title="Align Center"
      >
        <AlignCenter size={18} />
      </button>

      <button
        onClick={() => run((e) => e.chain().focus().setTextAlign("right").run())}
        className="p-2 hover:bg-gray-200 rounded"
        title="Align Right"
      >
        <AlignRight size={18} />
      </button>

      <button
        onClick={() =>
          run((e) => e.chain().focus().unsetAllMarks().clearNodes().run())
        }
        className="p-2 hover:bg-gray-200 rounded"
        title="Clear Formatting"
      >
        <Eraser size={18} />
      </button>

      {/* Color pickers */}
      <input
        type="color"
        onChange={(e) => applyColor(e.target.value)}
        className="w-8 h-8 cursor-pointer border rounded"
        title="Text Color"
      />
      <input
        type="color"
        onChange={(e) => applyBgColor(e.target.value)}
        className="w-8 h-8 cursor-pointer border rounded"
        title="Background Color"
      />

      {/* Font Family */}
      <select
        onChange={(e) =>
          run((ed) => ed.chain().focus().setFontFamily(e.target.value).run())
        }
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Font</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Courier New">Courier New</option>
      </select>

      {/* Font Size */}
      <select
        onChange={(e) =>
          run((ed) => ed.chain().focus().setFontSize(e.target.value).run())
        }
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Size</option>
        <option value="12px">12px</option>
        <option value="16px">16px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
      </select>
    </div>
  );
};

function UploadLesson() {
  const { classroomName } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);

  // ---------------- Tiptap Editors ----------------
  const [activeEditor, setActiveEditor] = useState(null);

  const titleEditor = useEditor({
    extensions: [
      StarterKit, // ✅ lists included
      TextStyle,
      Color,
      Highlight,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full border border-gray-300 rounded p-2 min-h-[40px] focus:outline-none",
      },
    },
  });

  const contentEditor = useEditor({
    extensions: [
      StarterKit, // ✅ lists included
      TextStyle,
      Color,
      Highlight,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full border border-gray-300 rounded p-3 min-h-[200px] focus:outline-none",
      },
    },
  });

  // ------------------------------------------------
  // ✅ Rest of your code unchanged …
  // ------------------------------------------------

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClose = () => {
    setIsModalVisible(false);
    navigate(-1);
  };

  const handleSubmit = async () => {
    const title = titleEditor?.getHTML().trim();
    const lessonContent = contentEditor?.getHTML().trim();

    if (!title) {
      alert("Please enter a lesson title.");
      return;
    }
    if (!lessonContent && files.length === 0) {
      alert("Please provide lesson content or upload files.");
      return;
    }
    if (!classroomName) {
      alert("Missing classroom name in URL.");
      return;
    }

    setUploading(true);

    try {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "learner"),
        where("classroom", "==", classroomName)
      );
      const learnerSnap = await getDocs(usersQuery);
      const learners = learnerSnap.docs.map((doc) => {
        const { firstName, lastName, email } = doc.data();
        return { id: doc.id, firstName, lastName, email };
      });

      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `lessons/${classroomName}/${title}/${file.name}`
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return { name: file.name, url };
        })
      );

      const lessonData = {
        title,
        content: lessonContent,
        files: uploadedFiles,
        createdAt: Timestamp.now(),
        date: new Date().toISOString(),
        classroom: classroomName,
        category: "learner",
        students: learners,
      };

      await addDoc(collection(db, "lessons"), lessonData);

      alert("Lesson uploaded successfully!");
      titleEditor?.commands.clearContent();
      contentEditor?.commands.clearContent();
      setFiles([]);
      handleClose();
    } catch (error) {
      console.error("Error uploading lesson:", error);
      alert("Failed to upload lesson. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!classroomName) {
      alert("No classroom specified in URL.");
      navigate("/admin/dashboard");
    }
  }, [classroomName, navigate]);

  if (!isModalVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Lesson - {classroomName}
        </h2>

        {/* Toolbar (shared between editors) */}
        <GlobalToolbar activeEditor={activeEditor} />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">
              Lesson Title
            </label>
            <EditorContent
              editor={titleEditor}
              onFocus={() => setActiveEditor(titleEditor)}
            />

            <label className="block text-sm font-semibold mt-6 mb-2">
              Lesson Content
            </label>
            <EditorContent
              editor={contentEditor}
              onFocus={() => setActiveEditor(contentEditor)}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">
              Upload Lesson Files (optional)
            </label>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <input type="file" multiple onChange={handleFileChange} />
              {files.length > 0 && (
                <ul className="list-disc text-sm text-gray-700 mt-2 pl-4">
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            className="bg-gray-600 text-white px-6 py-3 rounded"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadLesson;
