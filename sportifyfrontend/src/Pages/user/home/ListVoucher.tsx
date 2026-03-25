import VoucherOfUser from "../../admin/VorcherOfUser";

const ListVoucher = () => {
    const username = localStorage.getItem("username");
    return (
        <div className="container py-4 bg-light rounded shadow-sm mt-5">
            <VoucherOfUser username={username ? username : ""} ButtonAdd={false} />
        </div>
    )
}
export default ListVoucher;