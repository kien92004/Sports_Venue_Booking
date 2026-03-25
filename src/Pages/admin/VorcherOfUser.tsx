const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import BootstrapModal from '../../components/admin/BootstrapModal';

interface Voucher {
    voucherid: string;
    discountpercent: number;
    startdate?: string;
    enddate?: string;
}

interface UserVoucher {
    id: number;
    quantity: number;
    startDate: string;
    endDate: string;
    voucherid: Voucher;
}

interface VoucherOfUserProps {
    username: string;
    ButtonAdd: boolean;
}

const VoucherOfUser: React.FC<VoucherOfUserProps> = ({ username, ButtonAdd }) => {
    const [showVoucherForm, setShowVoucherForm] = useState(false);
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
    const [voucherForm, setVoucherForm] = useState({
        voucherid: '',
        quantity: 1,
        start_date: '',
        end_date: ''
    });

    // Fetch user's vouchers and all available vouchers
    useEffect(() => {
        if (username) {
            // Fetch user's vouchers
            axios.get(`${URL_BACKEND}/api/user/voucher-of-user?username=${username}`,
                { withCredentials: true }
            )
                .then(res => setUserVouchers(res.data))
                .catch(err => console.error('Error fetching user vouchers:', err));

            // Fetch all available vouchers
            axios.get(`${URL_BACKEND}/rest/vouchers/getAll`)
                .then(res => setAllVouchers(res.data))
                .catch(err => console.error('Error fetching vouchers:', err));
        }
    }, [username]); // Only re-run when username changes

    const handleAddVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const voucherData = {
                quantity: voucherForm.quantity,
                startDate: voucherForm.start_date,
                endDate: voucherForm.end_date,
                voucherid: voucherForm.voucherid,
                username: username
            };
            console.log("voucherData", voucherData);
            const response = await axios.post(`${URL_BACKEND}/api/user/voucher-of-user/add`, voucherData, {
                withCredentials: true
            });
            console.log('Add voucher response:', response.data);
            setUserVouchers(prev => [...prev, response.data]);
            setShowVoucherForm(false);
            setVoucherForm({
                voucherid: '',
                quantity: 1,
                start_date: '',
                end_date: ''
            });
            alert('Voucher đuợc thêm thành công!');
        } catch (error) {
            console.error('Error adding voucher:', error);
            alert('Thêm voucher thất bại');
        }
    };

    const handleRevokeVoucher = async (id: number) => {
        if (window.confirm('Are you sure you want to revoke this voucher?')) {
            try {
                await axios.delete(`${URL_BACKEND}/api/user/voucher-of-user/delete/${id}`, {
                    withCredentials: true
                });
                setUserVouchers(prevVouchers => prevVouchers.filter(voucher => voucher.id !== id));
                alert('Voucher đã được thu hồi thành công!');
            } catch (error) {
                console.error('Error revoking voucher:', error);
                alert('Thu hồi voucher thất bại');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Vouchers</h4>
                {ButtonAdd && (
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowVoucherForm(true)}
                    >
                        <i className="fa fa-plus"></i> Add Voucher
                    </button>
                )}
            </div>

            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th className='text-dark'>Voucher ID</th>
                            <th className='text-dark'>Discount</th>
                            <th className='text-dark'>Quantity</th>
                            <th className='text-dark'>Start Date</th>
                            <th className='text-dark'>End Date</th>
                            {ButtonAdd && <th className='text-dark'>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {userVouchers.map(item => (
                            <tr key={item.id}>
                                <td>{item.voucherid.voucherid}</td>
                                <td>{item.voucherid.discountpercent}%</td>
                                <td>{item.quantity}</td>
                                <td>{new Date(item.startDate).toLocaleDateString()}</td>
                                <td>{new Date(item.endDate).toLocaleDateString()}</td>
                                {ButtonAdd && (
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRevokeVoucher(item.id)}
                                        >
                                            <i className="fa fa-trash"></i> Revoke
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <BootstrapModal
                show={showVoucherForm}
                onHide={() => setShowVoucherForm(false)}
                title="Add New Voucher"
            >
                <form onSubmit={handleAddVoucher}>
                    <div className="mb-3">
                        <label className="form-label">Voucher</label>
                        <select
                            className="form-select"
                            value={voucherForm.voucherid}
                            onChange={e => setVoucherForm(prev => ({ ...prev, voucherid: e.target.value }))}
                            required
                        >
                            <option value="">Select a voucher</option>
                            {allVouchers.map(v => (
                                <option key={v.voucherid} value={v.voucherid}>
                                    {v.voucherid} - {v.discountpercent}% OFF
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={voucherForm.quantity}
                            onChange={e => setVoucherForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={voucherForm.start_date}
                            onChange={e => setVoucherForm(prev => ({ ...prev, start_date: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={voucherForm.end_date}
                            onChange={e => setVoucherForm(prev => ({ ...prev, end_date: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="text-end">
                        <button type="submit" className="btn btn-primary">Add Voucher</button>
                    </div>
                </form>
            </BootstrapModal>
        </div>
    );
};

export default VoucherOfUser;
