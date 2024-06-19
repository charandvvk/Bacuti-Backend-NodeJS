import {
    calculateTotalQuantity,
    createModels,
    fetchProductData,
} from "../utilities.js";

const createDynamicModels = (emissionType) => {
    return createModels({
        emission: `SELECT \`month\`, \`category\`, \`${emissionType}\` as \`value\` FROM \`emissions\` WHERE \`component_id\` = ?`,
    });
};

export const columnModel = async (emissionType) => {
    try {
        const result = {};
        const { emissionModel } = createDynamicModels(emissionType);
        const productData = await fetchProductData();
        for (const { subassemblies, components } of productData) {
            for (const {
                component_id,
                subassembly_parent_id,
                quantity,
            } of components) {
                const totalQuantity = calculateTotalQuantity(
                    subassembly_parent_id,
                    quantity,
                    subassemblies
                );
                const emissions = await emissionModel([component_id]);
                emissions.forEach(({ month, category, value }) => {
                    if (!result[month]) result[month] = { Actual: 0, Plan: 0 };
                    result[month][category] += value * totalQuantity;
                });
            }
        }
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
