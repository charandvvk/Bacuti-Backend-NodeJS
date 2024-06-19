import { columnModel } from "./models/column.js";
import { tableModel } from "./models/table.js";
import { pieModel } from "./models/pie.js";
import { handleRequest } from "./utilities.js";

export const columnController = (req, res) => {
    handleRequest(req, res, async () => {
        return await columnModel(req.params.emissionType);
    });
};

export const tableController = (req, res) => {
    handleRequest(req, res, async () => {
        return await tableModel();
    });
};

export const pieController = (req, res) => {
    handleRequest(req, res, async () => {
        return await pieModel();
    });
};
