const { Record, Account } = require("../models");
const dayjs = require("dayjs");

class RecordController {
  static async findAllAndGroupByDate(req, res, next) {
    try {
      let records = await Record.findAll({
        where: { UserId: req.currentUserId },
        order: [["updatedAt", "DESC"]],
      });

      const result = Object.values(
        records.reduce((acc, item) => {
          const formatted_time = dayjs(item.time).format("YYYY-MM-DD");

          if (acc[formatted_time]) {
            acc[formatted_time].rows.push(item);
          } else {
            acc[formatted_time] = {
              expired_date: formatted_time,
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

      const currentAccountInfo = await Account.increment(
        { current_balance: amount },
        { where: { id: AccountId } }
      );

      // === Transfer Feature ===

      // if (DestinationAccountId) {
      //
      // }

      // === Transfer Feature ===

      res.status(201).json({
        new_record: newRecord,
        current_account_info: currentAccountInfo[0][0][0],
      });
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
      const { amount: oldAmount, AccountId: oldAccountId } =
        await Record.findOne({ where: { id } });

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

      const oldAccountInfo = await Account.increment(
        { current_balance: oldAmount * -1 },
        { where: { id: oldAccountId } }
      );
      const currentAccountInfo = await Account.increment(
        { current_balance: amount },
        { where: { id: AccountId } }
      );

      res.status(200).json({
        updated_record: updatedRecord[1][0],
        old_account_info: oldAccountInfo[0][0][0],
        current_account_info: currentAccountInfo[0][0][0],
      });
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
        const currentAccountInfo = await Account.increment(
          { current_balance: record.amount * -1 },
          { where: { id: record.AccountId } }
        );

        res.status(200).json({
          deleted_record: deletedRecord,
          current_account_info: currentAccountInfo[0][0][0],
        });
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
