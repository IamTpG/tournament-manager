/**
 * Tiện ích ngày tháng dùng chung cho form.
 *
 * Backend trả về ngày đã format sẵn dạng "DD/MM/YYYY" (toLocaleDateString('en-GB')),
 * trong khi <input type="date"> chỉ chấp nhận "YYYY-MM-DD". Không chuyển đổi thì
 * ô chọn ngày hiện trống và người dùng vô tình gửi lại giá trị rỗng.
 */

/**
 * Chuyển giá trị ngày từ API thành chuỗi "YYYY-MM-DD" cho <input type="date">.
 * Chấp nhận cả "DD/MM/YYYY", chuỗi ISO, và đối tượng Date.
 *
 * @param {string|Date} value
 * @returns {string} "YYYY-MM-DD", hoặc chuỗi rỗng nếu không parse được
 */
export const toDateInputValue = (value) => {
  if (!value) return '';

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    date = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return '';

  // Dùng các thành phần theo giờ địa phương để không bị lệch một ngày do múi giờ.
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
