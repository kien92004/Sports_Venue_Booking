import React, { useRef, useState } from "react";
import "../../styles/AIChatInputWithMedia.css";

interface AIChatInputWithMediaProps {
  onSendMessage: (message: string, attachments: File[]) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isLoading: boolean;
}

const AIChatInputWithMedia: React.FC<AIChatInputWithMediaProps> = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isLoading,
}) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onStartRecording();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onStopRecording();
    }
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0 && !recordedBlob) {
      return;
    }

    let allAttachments = [...attachments];

    // Add recorded audio as file
    if (recordedBlob) {
      const audioFile = new File([recordedBlob], `audio-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      allAttachments = [...allAttachments, audioFile];
      setRecordedBlob(null);
    }

    onSendMessage(input, allAttachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    return "📎";
  };

  return (
    <div className="ai-input-media-wrapper">
      {/* Attachments preview */}
      {(attachments.length > 0 || recordedBlob) && (
        <div className="ai-attachments-preview">
          {attachments.map((file, index) => (
            <div key={index} className="ai-attachment-item">
              <span className="ai-attachment-icon">{getFileIcon(file)}</span>
              <span className="ai-attachment-name" title={file.name}>
                {file.name.length > 15
                  ? file.name.substring(0, 12) + "..."
                  : file.name}
              </span>
              <button
                className="ai-attachment-remove"
                onClick={() => removeAttachment(index)}
                type="button"
              >
                ✕
              </button>
            </div>
          ))}

          {recordedBlob && (
            <div className="ai-attachment-item">
              <span className="ai-attachment-icon">🎙️</span>
              <span className="ai-attachment-name">Ghi âm mới</span>
              <button
                className="ai-attachment-remove"
                onClick={() => setRecordedBlob(null)}
                type="button"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="ai-input-media-container">
        <textarea
          className="ai-textarea-input"
          placeholder=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />

        <div className="ai-input-media-buttons">
          {/* File upload button */}
          <button
            className="ai-media-btn ai-file-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Thêm file/ảnh"
            type="button"
            disabled={isLoading}
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Voice recording button */}
          <button
            className={`ai-media-btn ai-voice-btn ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
            type="button"
            disabled={isLoading}
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>

          {/* Send button */}
          <button
            className="ai-media-btn ai-send-btn"
            onClick={handleSend}
            title="Gửi"
            type="button"
            disabled={
              isLoading ||
              (!input.trim() && attachments.length === 0 && !recordedBlob)
            }
          >
            ➤
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="ai-recording-indicator">
          <span className="ai-recording-dot"></span>
          Đang ghi âm...
        </div>
      )}
    </div>
  );
};

export default AIChatInputWithMedia;
