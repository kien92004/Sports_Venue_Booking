export const translateWeatherCondition = (condition: string): string => {
  const weatherTranslations: { [key: string]: string } = {
    "Patchy rain nearby": "Mưa rải rác",
    "Moderate rain": "Mưa vừa",
    "Heavy rain": "Mưa to",
    "Light rain": "Mưa nhỏ",
    "Sunny": "Nắng",
    "Partly Cloudy": "Mây rải rác",
    "Cloudy": "Nhiều mây",
    "Clear": "Trời quang",
    "Overcast": "U ám",
    "Thundery outbreaks possible": "Có thể có dông"
  };
  return weatherTranslations[condition] || condition;
};

export const translateHolidayName = (summary: string): string => {
  const holidayTranslations: { [key: string]: string } = {
    "Independence Day": "Ngày Quốc Khánh",
    "Independence Day Holiday": "Nghỉ Quốc Khánh", 
    "New Year's Day": "Tết Dương Lịch",
    "Lunar New Year": "Tết Nguyên Đán",
    "Labor Day": "Ngày Quốc Tế Lao Động",
    "Reunification Day": "Ngày Giải Phóng Miền Nam",
    "Hung Kings Festival": "Giỗ Tổ Hùng Vương"
  };
  return holidayTranslations[summary] || summary;
};