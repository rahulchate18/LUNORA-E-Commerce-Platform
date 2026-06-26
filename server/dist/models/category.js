import mongoose, { Schema } from "mongoose";
// Category Schema
const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required."],
        unique: true,
        trim: true,
        maxlength: [50, "Category name cannot exceed 50 characters."],
    },
    slug: {
        type: String,
        required: [true, "Category slug is required."],
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
// Mongoose Indexes
categorySchema.index({ slug: 1 });
// Export model
export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
//# sourceMappingURL=category.js.map