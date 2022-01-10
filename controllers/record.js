const { Record, Account, Category } = require("../models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

class RecordController {
  static async findAllAndGroupByDate(req, res, next) {
    const { group, limit, offset } = req.query;
    let result = [];
    try {
      let records = await Record.findAll({
        where: { UserId: req.currentUserId },
        order: [["time", "DESC"]],
        limit,
        offset,
        include: [
          {
            model: Category,
            attributes: ["id", "color", "name", "icon"],
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "Account",
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "DestinationAccount",
          },
        ],
      });

      result = records;

      if (group && group === "date") {
        result = Object.values(
          records.reduce((acc, item) => {
            const formatted_time = dayjs(item.time).format("YYYY-MM-DD");

            if (acc[formatted_time]) {
              acc[formatted_time].rows.push(item);
            } else {
              acc[formatted_time] = {
                time: formatted_time,
                rows: [item],
              };
            }
            return acc;
          }, {})
        );
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findAllByAccIdAndGroupByDate(req, res, next) {
    const { account_id } = req.params;

    try {
      let records = await Record.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { UserId: req.currentUserId },
                { AccountId: account_id },
              ],
            },
            {
              [Op.and]: [
                { UserId: req.currentUserId },
                { DestinationAccountId: account_id },
              ],
            },
          ],
        },
        order: [["time", "DESC"]],
        include: [
          {
            model: Category,
            attributes: ["id", "color", "name", "icon"],
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "Account",
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "DestinationAccount",
          },
        ],
      });

      const result = Object.values(
        records.reduce((acc, item) => {
          const formatted_time = dayjs(item.time).format("YYYY-MM-DD");

          let appliedAmount = item.amount;
          if (item.type === "transfer" && item.AccountId == account_id) {
            appliedAmount *= -1;
          }

          if (acc[formatted_time]) {
            acc[formatted_time].rows.push(item);
            acc[formatted_time].total += appliedAmount;
          } else {
            acc[formatted_time] = {
              time: formatted_time,
              total: appliedAmount,
              rows: [item],
            };
          }
          return acc;
        }, {})
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async summarize(req, res, next) {
    const { start, end } = req.query;

    const parsedStart = dayjs.unix(+start);
    const parsedEnd = dayjs.unix(+end);

    try {
      const records = await Record.findAll({
        where: {
          time: {
            [Op.gte]: parsedStart.toDate(),
            [Op.lte]: parsedEnd.toDate(),
          },
          type: "expense",
        },
        order: [["time", "DESC"]],
        attributes: ["id", "type", "amount", "time"],
        include: [
          {
            model: Category,
            attributes: ["id", "color", "name", "icon", "visible"],
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "Account",
          },
          {
            model: Account,
            attributes: ["id", "color", "name"],
            as: "DestinationAccount",
          },
        ],
      });

      const summary = Object.values(
        records
          .filter((record) => record.Category.visible)
          .reduce((acc, item) => {
            const category = item.Category;

            if (acc[category.id]) {
              acc[category.id].spent += Math.abs(item.amount);
            } else {
              acc[category.id] = {
                category_name: category.name,
                category_icon: category.icon,
                category_color: category.color,
                spent: Math.abs(item.amount),
              };
            }
            return acc;
          }, {})
      );

      res.status(200).json({ start: parsedStart, end: parsedEnd, summary });
    } catch (error) {
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      const {
        type,
        amount,
        time,
        note,
        AccountId,
        CategoryId,
        DestinationAccountId,
      } = req.body;

      const newRecord = await Record.create({
        type,
        amount,
        time,
        note,
        AccountId,
        CategoryId,
        DestinationAccountId,
        UserId: req.currentUserId,
      });

      let response = { new_record: newRecord };

      let sourceAccount = null;
      let destinationAccount = null;
      let currentAccount = null;

      if (type === "transfer" && DestinationAccountId) {
        sourceAccount = await Account.decrement(
          { current_balance: amount },
          { where: { id: AccountId } }
        );
        destinationAccount = await Account.increment(
          { current_balance: amount },
          { where: { id: DestinationAccountId } }
        );
        response["source_account"] = sourceAccount[0][0][0];
        response["destination_account"] = destinationAccount[0][0][0];
      } else {
        currentAccount = await Account.increment(
          { current_balance: amount },
          { where: { id: AccountId } }
        );
        response["current_account"] = currentAccount[0][0][0];
      }

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    const {
      type,
      amount,
      time,
      note,
      AccountId,
      CategoryId,
      DestinationAccountId,
    } = req.body;

    const { id } = req.params;

    try {
      const {
        amount: oldAmount,
        AccountId: oldAccountId,
        DestinationAccountId: oldDestinationAccountId,
      } = await Record.findOne({ where: { id } });

      const updatedRecord = await Record.update(
        {
          type,
          amount,
          time,
          note,
          AccountId,
          CategoryId,
          DestinationAccountId,
        },
        { where: { id }, returning: true }
      );

      let response = { updated_record: updatedRecord[1][0] };

      let sourceAccount = null;
      let destinationAccount = null;
      let oldAccount = null;
      let currentAccount = null;

      if (type === "transfer" && DestinationAccountId) {
        await Account.increment(
          { current_balance: oldAmount },
          { where: { id: oldAccountId } }
        );
        await Account.decrement(
          { current_balance: oldAmount },
          { where: { id: oldDestinationAccountId } }
        );
        sourceAccount = await Account.decrement(
          { current_balance: amount },
          { where: { id: AccountId } }
        );
        destinationAccount = await Account.increment(
          { current_balance: amount },
          { where: { id: DestinationAccountId } }
        );
        response["source_account"] = sourceAccount[0][0][0];
        response["destination_account"] = destinationAccount[0][0][0];
      } else {
        oldAccount = await Account.increment(
          { current_balance: oldAmount * -1 },
          { where: { id: oldAccountId } }
        );
        currentAccount = await Account.increment(
          { current_balance: amount },
          { where: { id: AccountId } }
        );
        response["old_account"] = oldAccount[0][0][0];
        response["current_account"] = currentAccount[0][0][0];
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    const { id } = req.params;
    let deletedRecord;

    try {
      const record = await Record.findByPk(id);

      if (record) {
        deletedRecord = record;
        await Record.destroy({ where: { id } });

        let response = { deleted_record: deletedRecord };

        let currentAccount = null;
        let sourceAccount = null;
        let destinationAccount = null;

        if (record.type === "transfer") {
          sourceAccount = await Account.increment(
            { current_balance: record.amount },
            { where: { id: record.AccountId } }
          );
          destinationAccount = await Account.decrement(
            { current_balance: record.amount },
            { where: { id: record.DestinationAccountId } }
          );
          response["source_account"] = sourceAccount[0][0][0];
          response["destination_account"] = destinationAccount[0][0][0];
        } else {
          currentAccount = await Account.increment(
            { current_balance: record.amount * -1 },
            { where: { id: record.AccountId } }
          );
          response["current_account"] = currentAccount[0][0][0];
        }

        res.status(200).json(response);
      } else {
        next({
          status: 404,
          message: "Record not found",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecordController;
