import client from "./database/config.js";

export const handleRequest = async (_, res, callback) => {
    try {
        const result = await callback();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
};

export const createModels = (queries) =>
    Object.fromEntries(
        Object.entries(queries).map(([key, value]) => [
            `${key}Model`,
            async (fields) => {
                try {
                    return (await client.query(value, fields)).rows;
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },
        ])
    );

const { productModel, subassemblyModel, componentModel } = createModels({
    product: "SELECT * FROM products",
    subassembly: "SELECT * FROM subassemblies WHERE product_id = $1",
    component: "SELECT * FROM components WHERE product_id = $1",
});

export const fetchProductData = async () => {
    const products = await productModel();
    const productData = [];
    for (const { product_id, name } of products) {
        const subassemblies = await subassemblyModel([product_id]);
        const components = await componentModel([product_id]);
        productData.push({ product_id, name, subassemblies, components });
    }
    return productData;
};

export const calculateTotalQuantity = (
    subassembly_parent_id,
    quantity,
    subassemblies
) => {
    let totalQuantity = quantity;
    let subassemblyParentId = subassembly_parent_id;
    while (subassemblyParentId) {
        const { quantity, subassembly_parent_id } = subassemblies.find(
            ({ subassembly_id }) => subassembly_id === subassemblyParentId
        );

        totalQuantity *= quantity;
        subassemblyParentId = subassembly_parent_id;
    }
    return totalQuantity;
};
