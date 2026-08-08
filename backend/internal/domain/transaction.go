package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TransactionType string

const (
	TxTypeDeposit      TransactionType = "DEPOSIT"
	TxTypeSessionDebit TransactionType = "SESSION_DEBIT"
	TxTypeMentorPayout TransactionType = "MENTOR_PAYOUT"
	TxTypeRefund       TransactionType = "REFUND"
)

type TransactionStatus string

const (
	TxStatusPending TransactionStatus = "PENDING"
	TxStatusSuccess TransactionStatus = "SUCCESS"
	TxStatusFailed  TransactionStatus = "FAILED"
)

type Transaction struct {
	ID                 bson.ObjectID     `bson:"_id,omitempty" json:"id"`
	UserID             bson.ObjectID     `bson:"user_id" json:"user_id"`
	Type               TransactionType   `bson:"type" json:"type"`
	AmountCents        int64             `bson:"amount_cents" json:"amount_cents"`
	BalanceAfterCents  int64             `bson:"balance_after_cents" json:"balance_after_cents"`
	ReferenceSessionID *bson.ObjectID    `bson:"reference_session_id,omitempty" json:"reference_session_id,omitempty"`
	Gateway            string            `bson:"gateway" json:"gateway"`
	PaymentExternalID  string            `bson:"payment_external_id,omitempty" json:"payment_external_id,omitempty"`
	Description        string            `bson:"description" json:"description"`
	Status             TransactionStatus `bson:"status" json:"status"`
	CreatedAt          time.Time         `bson:"created_at" json:"created_at"`
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *Transaction) error
	ListByUserID(ctx context.Context, userID bson.ObjectID) ([]*Transaction, error)
}
