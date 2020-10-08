import React, { useRef, useEffect, useState } from "react";
import { CirclePicker } from "react-color";
import axios from "axios";
import FileSaver from "file-saver";
import "./app.css";

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selected, setSelected] = useState("black");
  const [extra, setextra] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.width = "600px";
    canvas.style.height = "600px";
    const context = canvas.getContext("2d");
    context.scale(1, 1);
    context.lineCap = "round";
    context.strokeStyle = selected;
    context.lineWidth = 5;
    contextRef.current = context;
  }, [extra]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = selected;
  }, [selected]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const handleDownload = () => {
    const result = canvasRef.current.toDataURL();
    const data = { canvas: result };
    axios
      .post("https://app-6-backend.herokuapp.com/api/canvasToPdf", data, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        console.log(res);
        FileSaver.saveAs(
          new Blob([res.data], { type: "application/pdf" }),
          "sample.pdf"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="mainBlock">
      <div className="colorSelector">
        <CirclePicker
          color={selected}
          onChangeComplete={(color) => setSelected(color.hex)}
        />
      </div>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        style={{ border: "solid 2px black" }}
      />
      <div className="download">
        <button onClick={handleDownload}>Download as PDF</button>
        <button onClick={() => setextra(!extra)}>clean Canvas</button>
      </div>
    </div>
  );
}

export default App;
