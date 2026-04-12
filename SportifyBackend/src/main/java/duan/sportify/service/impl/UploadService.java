package duan.sportify.service.impl;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    String uploadImage(MultipartFile file, String type) throws Exception;
}

