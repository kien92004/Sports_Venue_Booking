package duan.sportify.service.impl;

import java.util.List;
import java.util.Optional;
import java.text.DecimalFormat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.DTO.FieldWithDistanceDTO;
import duan.sportify.dao.FavoriteFieldDAO;
import duan.sportify.dao.FieldDAO;
import duan.sportify.dao.UserDAO;
import duan.sportify.entities.FavoriteField;
import duan.sportify.entities.Field;
import duan.sportify.entities.Shifts;
import duan.sportify.entities.Users;
import duan.sportify.service.FieldService;

@SuppressWarnings("unused")
@Service
public class FieldServiceImpl implements FieldService {
	@Autowired
	FieldDAO fieldDAO;
	@Autowired
	duan.sportify.service.UserService userService;

	@Override
	public List<Field> findAll() {
		// TODO Auto-generated method stub
		return fieldDAO.findAll();
	}

	@Override
	public Field findById(Integer id) {
		// TODO Auto-generated method stub
		return fieldDAO.findById(id).get();
	}

	@Override
	public List<Field> findBySporttypeId(String cid) {
		// TODO Auto-generated method stub
		return fieldDAO.findBySporttypeId(cid);
	}

	@Override
	public Field create(Field fields) {
		// TODO Auto-generated method stub
		return fieldDAO.save(fields);
	}

	@Override
	public Field update(Field fields) {
		// TODO Auto-generated method stub
		return fieldDAO.save(fields);
	}

	@Override
	public List<Field> findSearch(String dateInput, String categorySelect, Integer shiftSelect) {
		// TODO Auto-generated method stub
		return fieldDAO.findSearch(dateInput, categorySelect, shiftSelect);
	}

	@Override
	public List<Field> findFieldById(Integer id) {
		// TODO Auto-generated method stub
		return fieldDAO.findFieldById(id);
	}

	@Override
	public String findNameSporttypeById(Integer id) {
		// TODO Auto-generated method stub
		return fieldDAO.findNameSporttypeById(id);
	}

	@Override
	public String findIdSporttypeById(Integer id) {
		// TODO Auto-generated method stub
		return fieldDAO.findIdSporttypeById(id);
	}

	@Override
	public List<Field> findBySporttypeIdlimit3(String cid) {
		// TODO Auto-generated method stub
		return fieldDAO.findBySporttypeIdlimit3(cid);
	}

	@Override
	public void deleteBookingDetailsByFieldId(Integer fieldId) {
		// TODO Auto-generated method stub
		fieldDAO.deleteBookingDetailsByFieldId(fieldId);
	}

	@Override
	public void deleteById(Integer id) {
		// TODO Auto-generated method stub
		fieldDAO.deleteById(id);
	}

	
    @Autowired
    private FavoriteFieldDAO favoriteFieldDAO;

    @Autowired
    private UserDAO userDAO;

    @Override
    public void addFavoriteField(String username, Integer fieldId) {
        Users user = userDAO.findByUsername(username);
        Field field = fieldDAO.findById(fieldId)
                              .orElseThrow(() -> new RuntimeException("Field not found"));

        FavoriteField favorite = new FavoriteField();
        favorite.setUsername(user);
        favorite.setField(field);

        favoriteFieldDAO.save(favorite); // ✅ đúng kiểu FavoriteField
    }

    @Override
    public void removeFavoriteField(String username, Integer fieldId) {
        favoriteFieldDAO.removeFavoriteField(username, fieldId);
    }

    @Override
    public List<FavoriteField> findFavoriteByUsername(String username) {
        return favoriteFieldDAO.findFavoriteByUsername(username);
    }
	@Override
	public boolean checkFavoriteField( String username, Integer fieldId) {
		// TODO Auto-generated method stub
		return favoriteFieldDAO.checkFavoriteField( username, fieldId);
	}
	@Override
	public Optional<Field> findFieldByName(String name) {
		// TODO Auto-generated method stub
		return fieldDAO.findFieldByName(name);
	}
	
    @Override
    public List<FieldWithDistanceDTO> findNearestFields(Double userLat, Double userLng, String sporttypeId,
        Integer limit, Double maxDistanceKm) {
        // Đảm bảo tọa độ hợp lệ trước khi tìm kiếm
        if (userLat < 8 || userLat > 23 || userLng < 102 || userLng > 109) {
            System.out.println("CẢNH BÁO: Tọa độ nằm ngoài khu vực Việt Nam: " + userLat + ", " + userLng);
            System.out.println("Đang điều chỉnh tọa độ về khu vực TP.HCM...");
            // Nếu tọa độ không nằm trong vùng Việt Nam, sử dụng tọa độ trung tâm TP.HCM
            userLat = 10.7769;
            userLng = 106.7;
        }

        double effectiveMaxDistance = (maxDistanceKm != null && maxDistanceKm > 0) ? maxDistanceKm : 50.0;
        int effectiveLimit = (limit != null && limit > 0) ? limit : 10;

        List<Field> candidates = fieldDAO.findActiveFieldsWithCoordinates(sporttypeId);
        List<FieldWithDistanceDTO> fieldWithDistances = new java.util.ArrayList<>();

        if (candidates == null || candidates.isEmpty()) {
            System.out.println("Không có sân nào với tọa độ hợp lệ để tính khoảng cách.");
            return fieldWithDistances;
        }

        System.out.println("Tổng số sân đủ điều kiện để tính khoảng cách: " + candidates.size());

        DecimalFormat df = new DecimalFormat("#.##");

		for (Field field : candidates) {
			if (field.getLatitude() == null || field.getLongitude() == null) {
				continue;
			}
			double distance = calculateDistanceKm(userLat, userLng, field.getLatitude(), field.getLongitude());
            if (distance <= effectiveMaxDistance) {
                FieldWithDistanceDTO dto = new FieldWithDistanceDTO();
                dto.setField(field);
                dto.setDistance(distance);
                String formattedDistance = distance < 1 ? df.format(distance * 1000) + " m"
                    : df.format(distance) + " km";
                dto.setFormattedDistance(formattedDistance);
                fieldWithDistances.add(dto);
            }
        }

        fieldWithDistances.sort((d1, d2) -> Double.compare(d1.getDistance(), d2.getDistance()));

        System.out.println("Số sân trong bán kính " + effectiveMaxDistance + " km: " + fieldWithDistances.size());

		if (fieldWithDistances.size() > effectiveLimit) {
			return new java.util.ArrayList<>(fieldWithDistances.subList(0, effectiveLimit));
		}

		return fieldWithDistances;
    }

    // Haversine formula to calculate distance between two coordinates in km
    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
