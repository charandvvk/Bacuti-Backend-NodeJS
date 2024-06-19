import {
    calculateTotalQuantity,
    createModels,
    fetchProductData,
} from "../utilities.js";

const { emissionModel } = createModels({
    emission: `SELECT \`scope_1\`, \`scope_2\`, \`category_1\`, \`category_5\`, \`category_12\` FROM \`emissions\` WHERE \`component_id\` = ? AND \`category\` = "Actual"`,
});

export const pieModel = async () => {
    try {
        const result = {
            scope1: 0,
            scope2: 0,
            category1: 0,
            category5: 0,
            category12: 0,
        };
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
                emissions.forEach(
                    ({
                        scope_1,
                        scope_2,
                        category_1,
                        category_5,
                        category_12,
                    }) => {
                        result.scope1 += scope_1 * totalQuantity;
                        result.scope2 += scope_2 * totalQuantity;
                        result.category1 += category_1 * totalQuantity;
                        result.category5 += category_5 * totalQuantity;
                        result.category12 += category_12 * totalQuantity;
                    }
                );
            }
        }
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
