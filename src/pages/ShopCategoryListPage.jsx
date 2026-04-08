import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import ShopCategoryListLayer from "../components/ShopCategoryListLayer";

const ShopCategoryListPage = () => {
    return (
        <>
            <MasterLayout>
                <ShopCategoryListLayer />
            </MasterLayout>
        </>
    );
};

export default ShopCategoryListPage;
