const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import BootstrapModal from '../../components/admin/BootstrapModal';

interface Contact {
  contactid: string;
  username: string;
  datecontact: string;
  category: string;
  title: string;
  meesagecontact: string;
  users?: {
    firstname: string;
    lastname: string;
    image?: string;
  };
}

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState({
    searchDate: "",
    searchCate: "",
  });

  // Fetch all contacts
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/contacts/getAll`)
      .then(res => res.json())
      .then(data => setContacts(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.searchDate) params.append("datecontact", search.searchDate);
    if (search.searchCate) params.append("category", search.searchCate);
    fetch(`${URL_BACKEND}/rest/contacts/search?${params}`)
      .then(res => res.json())
      .then(data => setContacts(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ searchDate: "", searchCate: "" });
    fetch(`${URL_BACKEND}/rest/contacts/getAll`)
      .then(res => res.json())
      .then(data => setContacts(data));
  };

  // Open edit modal
  const openEditModal = (contact: Contact) => {
    setForm(contact);
    setShowEdit(true);
    // setErrors([]);  // Not currently implemented
  };

  // Delete contact handler
  const handleDeleteContact = (contactid: string) => {
    fetch(`${URL_BACKEND}/rest/contacts/delete/${contactid}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        setContacts(prev => prev.filter(c => c.contactid !== contactid));
        setShowEdit(false);
      });
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Liên hệ</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Liên hệ</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input type="date" className="form-control"
              value={search.searchDate}
              onChange={e => setSearch(s => ({ ...s, searchDate: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-2">
            <select className="form-select"
              value={search.searchCate}
              onChange={e => setSearch(s => ({ ...s, searchCate: e.target.value }))}
            >
              <option value="">Tất cả</option>
              <option value="Giao diện">Giao diện</option>
              <option value="Chức năng">Chức năng</option>
              <option value="Liên hệ quảng cáo">Liên hệ quảng cáo</option>
              <option value="Hiệu suất">Hiệu suất</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-success w-100" onClick={handleSearch}>Tìm kiếm</button>
          </div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>Làm mới</button>
          </div>
        </form>
        {/* /Search Filter */}

        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Người liên hệ</th>
                    <th>Ngày yêu cầu</th>
                    <th>Loại liên hệ</th>
                    <th>Tiêu đề</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((item, idx) => (
                    <tr key={item.contactid}>
                      <td>{idx + 1}</td>
                      <td>
                        {item.users
                          ? `${item.users.firstname} ${item.users.lastname}`
                          : item.username}
                      </td>
                      <td>{formatDate(item.datecontact)}</td>
                      <td>{item.category}</td>
                      <td>{item.title}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-outline-primary btn-sm"
                            onClick={() => openEditModal(item)}>
                            <i className="fa fa-pencil me-1"></i> Xem chi tiết
                          </button>
                          <button className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteContact(item.contactid)}>
                            <i className="fa fa-trash me-1"></i> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <BootstrapModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          title="Chi tiết liên hệ"
          size="lg"
          scrollable={false}
          bodyClassName="contact-modal-body"
          topOffset="8%"
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Đóng</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDeleteContact(form.contactid || "")}>Xóa</button>
            </>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Người liên hệ <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={
                      form.users
                        ? `${form.users.firstname} ${form.users.lastname}`
                        : form.username || ""
                    }
                    readOnly
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Ngày liên hệ <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.datecontact ? formatDate(form.datecontact) : ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Loại liên hệ <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.category || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Tiêu đề <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.title || ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Tin nhắn <span className="text-danger">*</span></label>
                  <textarea className="form-control"
                    value={form.meesagecontact || ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </form>
        </BootstrapModal>

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default ContactPage;
