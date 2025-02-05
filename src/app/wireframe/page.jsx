"use client"
import DisplayWireframe from "../components/DisplayWireframe";
import ModifyChat from "../components/ModifyChat";
import CodeEditor from "../components/CodeEditor";
import Navbar from "../components/Navbar";
const Wireframe = () => {

  return (
    <div className="min-h-screen  p-0">
      <Navbar/>
      <div className="  p-0 sm:flex-row flex-col-reverse flex sm:gap-5 bg-gray-700">
        <div className=" ">

          <ModifyChat />
        </div>
        <div className="w-[80%]">
          {/* <DisplayWireframe svgCode={image} /> */}
          <CodeEditor  />
        </div>
      </div>
    </div>
  );
};

export default Wireframe;
