import React from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import { GripVertical, Pencil, Trash2, PlayCircle, FileVideo, UploadCloud, Plus, ChevronDown, Image as ImageIcon } from 'lucide-react';

const CourseBuilder = () => {
  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <InstructorSidebar />
      
      <main className="flex-1 ml-64 p-10 flex gap-8">
        {/* Main Center Area */}
        <div className="flex-1 max-w-3xl flex flex-col relative pb-20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-textMain tracking-tight mb-2">Advanced UI/UX Patterns</h1>
            <p className="text-secondary text-lg">Curriculum Builder</p>
          </div>

          <div className="space-y-6">
            {/* Section 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <GripVertical size={20} className="text-gray-400 cursor-move" />
                  <h3 className="text-xl font-bold text-textMain">Section 1: Fundamentals</h3>
                </div>
                <div className="flex gap-4 text-gray-400">
                  <button className="hover:text-primary transition-colors"><Pencil size={18} /></button>
                  <button className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="space-y-4 pl-8">
                {/* Lesson 1.1 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <PlayCircle size={16} />
                    </div>
                    <span className="font-medium text-textMain">1.1 Introduction to Claymorphism</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-400">04:20</span>
                </div>

                {/* Lesson 1.2 */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <GripVertical size={16} className="text-gray-400 cursor-move" />
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                        <FileVideo size={16} />
                      </div>
                      <span className="font-medium text-textMain">1.2 Depth and Shadow Physics</span>
                    </div>
                  </div>
                  
                  {/* Upload Area */}
                  <div className="ml-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-colors cursor-pointer">
                    <UploadCloud size={32} className="text-gray-400 mb-3" />
                    <p className="text-textMain font-medium mb-1">Drag and drop video file</p>
                    <p className="text-secondary text-sm">or click to browse (MP4, max 2GB)</p>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-primary font-semibold py-2 mt-4 hover:text-primaryHover transition-colors ml-4">
                  <Plus size={18} />
                  Add Lesson
                </button>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-gray-400" />
                <h3 className="text-xl font-bold text-textMain">Section 2: Implementation</h3>
              </div>
              <ChevronDown size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-soft-purple hover:scale-105 transition-transform">
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Right Sidebar (Settings) */}
        <div className="w-80 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Settings size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-textMain">Course Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-textMain mb-2">Course Thumbnail</label>
              <div className="w-full h-40 bg-teal-100 rounded-2xl overflow-hidden relative group">
                {/* Fake Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-teal-800 opacity-20">
                  <ImageIcon size={64} />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white text-textMain px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <ImageIcon size={16} />
                    Change Image
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-textMain mb-2">Course Title</label>
              <input 
                type="text" 
                className="input-field bg-white" 
                defaultValue="Advanced UI/UX Patterns" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-textMain mb-2">Description</label>
              <textarea 
                className="input-field bg-white min-h-[120px] resize-none" 
                defaultValue="Master the art of tactile digital design using modern front-end frameworks."
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-bold text-textMain">Visibility</span>
              <div className="bg-gray-100 p-1 rounded-full flex text-sm font-semibold">
                <button className="px-4 py-1.5 bg-primary text-white rounded-full shadow-sm">Draft</button>
                <button className="px-4 py-1.5 text-gray-500 hover:text-textMain rounded-full">Public</button>
              </div>
            </div>

            <button className="btn-primary w-full mt-4">
              Save & Publish
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseBuilder;
