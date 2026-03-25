export interface ValidationError {
    [key: string]: string;
}

export interface OnceBookingData {
    fieldId: string;
    shiftId: string;
    playDate: string;
    nameCustomer: string;
    phoneCustomer: string;
    note: string;
    isDeposit: boolean;
}

export interface PermanentBookingData {
    fieldId: string;
    startDate: string;
    endDate: string;
    nameCustomer: string;
    phoneCustomer: string;
    note: string;
    selectedWeekdays: number[];
    shiftsPerDay: Record<number, number>;
    isDeposit: boolean;
}

/**
 * Validate phone number according to entity pattern: ^(0|\+84)\d{9,10}$
 */
export const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
        return "Số điện thoại là bắt buộc";
    }

    const phoneRegex = /^(0|\+84)\d{9,10}$/;
    if (!phoneRegex.test(phone.trim())) {
        return "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)";
    }

    return "";
};

/**
 * Validate customer name (maps to username field requirements)
 */
export const validateCustomerName = (name: string): string => {
    if (!name.trim()) {
        return "Tên khách hàng là bắt buộc";
    }

    if (name.trim().length < 2) {
        return "Tên phải có ít nhất 2 ký tự";
    }

    if (name.trim().length > 16) {
        return "Tên không được vượt quá 16 ký tự (theo quy định hệ thống)";
    }

    return "";
};

/**
 * Validate note according to entity max length (200 characters)
 */
export const validateNote = (note: string): string => {
    if (note && note.trim().length > 200) {
        return "Ghi chú không được vượt quá 200 ký tự";
    }

    return "";
};

/**
 * Validate single date (for playdate in once booking)
 */
export const validatePlayDate = (date: string): string => {
    if (!date.trim()) {
        return "Ngày chơi là bắt buộc";
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
        return "Ngày không hợp lệ";
    }

    if (selectedDate < today) {
        return "Không thể chọn ngày trong quá khứ";
    }

    return "";
};

/**
 * Validate start date for permanent booking
 */
export const validateStartDate = (startDate: string): string => {
    if (!startDate.trim()) {
        return "Ngày bắt đầu là bắt buộc";
    }

    const selectedDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
        return "Ngày bắt đầu không hợp lệ";
    }

    if (selectedDate < today) {
        return "Ngày bắt đầu không thể là ngày trong quá khứ";
    }

    return "";
};

/**
 * Validate end date for permanent booking
 */
export const validateEndDate = (endDate: string, startDate: string): string => {
    if (!endDate.trim()) {
        return "Ngày kết thúc là bắt buộc";
    }

    const endDateObj = new Date(endDate);

    if (isNaN(endDateObj.getTime())) {
        return "Ngày kết thúc không hợp lệ";
    }

    if (!startDate.trim()) {
        return "Vui lòng chọn ngày bắt đầu trước";
    }

    const startDateObj = new Date(startDate);

    if (endDateObj <= startDateObj) {
        return "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Check if date range is not too long (max 1 year)
    const maxEndDate = new Date(startDateObj);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);

    if (endDateObj > maxEndDate) {
        return "Khoảng thời gian không được vượt quá 1 năm";
    }

    return "";
};

/**
 * Validate field selection
 */
export const validateFieldId = (fieldId: string): string => {
    if (!fieldId || fieldId.trim() === "") {
        return "Vui lòng chọn sân";
    }

    return "";
};

/**
 * Validate shift selection
 */
export const validateShiftId = (shiftId: string): string => {
    if (!shiftId || shiftId.trim() === "") {
        return "Vui lòng chọn ca";
    }

    return "";
};

/**
 * Validate weekday selection for permanent booking
 */
export const validateWeekdays = (selectedWeekdays: number[]): string => {
    if (selectedWeekdays.length === 0) {
        return "Vui lòng chọn ít nhất một ngày trong tuần";
    }

    // Validate weekday values (2-8 for Monday-Sunday)
    const validWeekdays = selectedWeekdays.every(day => day >= 2 && day <= 8);
    if (!validWeekdays) {
        return "Ngày trong tuần không hợp lệ";
    }

    return "";
};

/**
 * Validate shifts assignment for permanent booking
 */
export const validateShiftsPerDay = (
    selectedWeekdays: number[],
    shiftsPerDay: Record<number, number>
): string => {
    const missingShifts = selectedWeekdays.filter(day => !shiftsPerDay[day]);

    if (missingShifts.length > 0) {
        return "Vui lòng chọn ca cho tất cả các ngày đã chọn";
    }

    return "";
};

/**
 * Comprehensive validation for once booking form
 */
export const validateOnceBookingForm = (data: OnceBookingData): ValidationError => {
    const errors: ValidationError = {};

    const fieldError = validateFieldId(data.fieldId);
    if (fieldError) errors.fieldId = fieldError;

    const shiftError = validateShiftId(data.shiftId);
    if (shiftError) errors.shiftId = shiftError;

    const playDateError = validatePlayDate(data.playDate);
    if (playDateError) errors.playDate = playDateError;

    const nameError = validateCustomerName(data.nameCustomer);
    if (nameError) errors.nameCustomer = nameError;

    const phoneError = validatePhone(data.phoneCustomer);
    if (phoneError) errors.phoneCustomer = phoneError;

    const noteError = validateNote(data.note);
    if (noteError) errors.note = noteError;

    return errors;
};

/**
 * Comprehensive validation for permanent booking form
 */
export const validatePermanentBookingForm = (data: PermanentBookingData): ValidationError => {
    const errors: ValidationError = {};

    const fieldError = validateFieldId(data.fieldId);
    if (fieldError) errors.fieldId = fieldError;

    const startDateError = validateStartDate(data.startDate);
    if (startDateError) errors.startDate = startDateError;

    const endDateError = validateEndDate(data.endDate, data.startDate);
    if (endDateError) errors.endDate = endDateError;

    const weekdaysError = validateWeekdays(data.selectedWeekdays);
    if (weekdaysError) errors.weekdays = weekdaysError;

    const shiftsError = validateShiftsPerDay(data.selectedWeekdays, data.shiftsPerDay);
    if (shiftsError) errors.shifts = shiftsError;

    const nameError = validateCustomerName(data.nameCustomer);
    if (nameError) errors.nameCustomer = nameError;

    const phoneError = validatePhone(data.phoneCustomer);
    if (phoneError) errors.phoneCustomer = phoneError;

    const noteError = validateNote(data.note);
    if (noteError) errors.note = noteError;

    return errors;
};

/**
 * Utility function to check if validation errors exist
 */
export const hasValidationErrors = (errors: ValidationError): boolean => {
    return Object.keys(errors).length > 0;
};

/**
 * Utility function to clear specific field error
 */
export const clearFieldError = (
    errors: ValidationError,
    fieldName: string
): ValidationError => {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
};

/**
 * Real-time validation for individual fields
 */
export const validateSingleField = (
    fieldName: string,
    value: any,
    formType: 'once' | 'permanent',
    additionalData?: any
): string => {
    switch (fieldName) {
        case 'fieldId':
            return validateFieldId(value);

        case 'shiftId':
            return validateShiftId(value);

        case 'playDate':
            return validatePlayDate(value);

        case 'startDate':
            return validateStartDate(value);

        case 'endDate':
            return validateEndDate(value, additionalData?.startDate || '');

        case 'nameCustomer':
            return validateCustomerName(value);

        case 'phoneCustomer':
            return validatePhone(value);

        case 'note':
            return validateNote(value);

        case 'selectedWeekdays':
            if (formType === 'permanent') {
                return validateWeekdays(value);
            }
            return '';

        case 'shiftsPerDay':
            if (formType === 'permanent' && additionalData?.selectedWeekdays) {
                return validateShiftsPerDay(additionalData.selectedWeekdays, value);
            }
            return '';

        default:
            return '';
    }
};

/**
 * Update errors state with single field validation
 */
export const updateFieldError = (
    currentErrors: ValidationError,
    fieldName: string,
    errorMessage: string
): ValidationError => {
    if (errorMessage) {
        return {
            ...currentErrors,
            [fieldName]: errorMessage
        };
    } else {
        return clearFieldError(currentErrors, fieldName);
    }
};