/**
 * Các hàm kiểm tra dữ liệu dùng chung cho mọi form.
 *
 * Trước đây isAlphaNum/isPositive chỉ tồn tại bên trong CreateTournament.jsx và
 * không nơi nào khác dùng lại — dẫn đến EditTournament sửa đúng thực thể đó mà
 * không kiểm tra gì cả. Khối kiểm tra "không được để trống" cũng bị chép lại
 * hàng chục lần ở ba file khác nhau.
 */

export const REQUIRED_MESSAGE = 'Không được để trống';

/** Chỉ chứa chữ cái và chữ số (không dấu, không khoảng trắng). */
export const isAlphaNum = (str) => /^[A-Za-z0-9]+$/.test(str ?? '');

/** Số nguyên dương, không cho số 0 đứng đầu. */
export const isPositiveInt = (str) => /^[1-9][0-9]*$/.test(String(str ?? ''));

/** Đường dẫn http(s) hợp lệ — chặn javascript:/data: vốn được render thẳng vào src/href. */
export const isUrl = (str) => {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str ?? '');

/** Số điện thoại: chữ số và một vài ký tự phân cách thường gặp, 8-20 ký tự. */
export const isPhone = (str) => /^[0-9+\s.-]{8,20}$/.test(str ?? '');

/** Chuỗi ngày parse được thành Date hợp lệ. */
export const isValidDate = (str) => !!str && !Number.isNaN(new Date(str).getTime());

/**
 * Kiểm tra các trường bắt buộc và trả về object lỗi theo dạng { tênTrường: thôngBáo }.
 * @param {Object} formData - dữ liệu form hiện tại
 * @param {Array<string>} fields - danh sách tên trường bắt buộc
 * @returns {Object} object lỗi (rỗng nếu hợp lệ)
 */
export const checkRequired = (formData, fields) => {
  const errors = {};
  for (const field of fields) {
    const value = formData[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field] = REQUIRED_MESSAGE;
    }
  }
  return errors;
};

/**
 * Lấy thông báo lỗi từ response của backend.
 *
 * Backend trả về { message, errors } — `message` để hiện nhanh, `errors` để gắn
 * vào từng ô nhập. Nhiều form trước đây bỏ qua hoàn toàn phần này và chỉ hiện
 * một câu tiếng Anh cứng, hoặc hiện "undefined" khi mất mạng.
 *
 * @param {Error} err - lỗi từ axios
 * @param {string} fallback - thông báo dùng khi không lấy được gì từ server
 * @returns {{ message: string, errors: Object }}
 */
export const getServerError = (err, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') => ({
  message: err?.response?.data?.message || err?.message || fallback,
  errors: err?.response?.data?.errors || {}
});
