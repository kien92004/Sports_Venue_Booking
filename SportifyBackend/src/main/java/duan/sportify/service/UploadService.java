package duan.sportify.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UploadService {
    private final Cloudinary cloudinary;

    /**
     * Upload file lên Cloudinary và lưu vào DB
     * 
     * @param file MultipartFile
     * @param type loại ảnh: "avatar", "product", "field"
     */
    public String uploadImage(MultipartFile file, String type) throws Exception {
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "sportify/" + type));

        String url = uploadResult.get("secure_url").toString();
        String relativePath = url.split("/upload/")[1];

        return relativePath;
    }
}
