import {
    calculateTotalQuantity,
    createModels,
    fetchProductData,
} from "../utilities.js";

const { emissionModel } = createModels({
    emission: `SELECT scope_1, scope_2, scope_3 FROM emissions WHERE component_id = $1 AND category = 'Actual'`,
});

export const tableModel = async () => {
    try {
        const result = {};
        const productData = await fetchProductData();
        for (const {
            product_id,
            name,
            subassemblies,
            components,
        } of productData) {
            const product = {
                name,
                type: "product",
                scope_1: 0,
                scope_2: 0,
                scope_3: 0,
                subassemblies: {},
                components: {},
            };
            result[product_id] = product;
            for (const {
                component_id,
                subassembly_parent_id,
                name,
                quantity,
            } of components) {
                const totalQuantity = calculateTotalQuantity(
                    subassembly_parent_id,
                    quantity,
                    subassemblies
                );
                const component = {
                    name,
                    type: "component",
                    parentId: subassembly_parent_id ?? product_id,
                    scope_1: 0,
                    scope_2: 0,
                    scope_3: 0,
                };
                const emissions = await emissionModel([component_id]);
                emissions.forEach(({ scope_1, scope_2, scope_3 }) => {
                    component.scope_1 += scope_1 * totalQuantity;
                    component.scope_2 += scope_2 * totalQuantity;
                    component.scope_3 += scope_3 * totalQuantity;
                });
                result[product_id].components[component_id] = component;
                let subassemblyParentId = subassembly_parent_id;
                while (subassemblyParentId) {
                    const { product_id, subassembly_parent_id, name } =
                        subassemblies.find(
                            ({ subassembly_id }) =>
                                subassembly_id === subassemblyParentId
                        );
                    if (!result[product_id].subassemblies[subassemblyParentId])
                        result[product_id].subassemblies[subassemblyParentId] =
                            {
                                name,
                                type: "subassembly",
                                parentId: subassembly_parent_id ?? product_id,
                                scope_1: 0,
                                scope_2: 0,
                                scope_3: 0,
                            };
                    product.subassemblies[subassemblyParentId].scope_1 +=
                        component.scope_1;
                    product.subassemblies[subassemblyParentId].scope_2 +=
                        component.scope_2;
                    product.subassemblies[subassemblyParentId].scope_3 +=
                        component.scope_3;
                    subassemblyParentId = subassembly_parent_id;
                }
                product.scope_1 += component.scope_1;
                product.scope_2 += component.scope_2;
                product.scope_3 += component.scope_3;
            }
        }
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
