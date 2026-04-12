package duan.sportify.service.serviceAIAdmin;
import ai.onnxruntime.*;
import org.springframework.stereotype.Service;
import java.io.InputStream;


import java.io.IOException;
import java.util.*;

@Service
public class ModelService {
    private final OrtEnvironment env = OrtEnvironment.getEnvironment();
    private final OrtSession session;

    public ModelService() throws OrtException, IOException {
        // ✅ Đọc file model từ resources (đường dẫn tương đối)
        try (InputStream modelStream = getClass().getResourceAsStream("/models/field_booking_xgb.onnx")) {
            if (modelStream == null) {
                throw new IllegalStateException("Không tìm thấy model tại /models/field_booking_xgb.onnx");
            }

            byte[] modelBytes = modelStream.readAllBytes();
            this.session = env.createSession(modelBytes, new OrtSession.SessionOptions());
        }
    }

    public float predictSingle(float[] inputData) throws OrtException {
        Map<String, OnnxTensor> inputMap = new HashMap<>();
        OnnxTensor inputTensor = OnnxTensor.createTensor(this.env, new float[][]{inputData});
        String inputName = this.session.getInputNames().iterator().next();

        inputMap.put(inputName, inputTensor);
        try (OrtSession.Result result = this.session.run(inputMap)) {
            float[][] preds = (float[][]) result.get(0).getValue();
            return preds[0][0];
        }
    }
}