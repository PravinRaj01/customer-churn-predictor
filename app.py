import streamlit as st
import pandas as pd
import pickle

# 1. Load the saved Gradient Boosting model and column names
@st.cache_resource
def load_model():
    with open('churn_model.pkl', 'rb') as file:
        model = pickle.load(file)
    with open('model_columns.pkl', 'rb') as file:
        cols = pickle.load(file)
    return model, cols

model, model_columns = load_model()

# 2. Build the User Interface (Frontend)
st.title("📊 Customer Churn Predictor")
st.write("Will your customer cancel their subscription? Enter their details below to find out.")

# Create input fields matching our 4 features
tenure = st.slider("Months with company (Tenure)", min_value=0, max_value=72, value=12)
monthly_charges = st.number_input("Monthly Charges ($)", min_value=0.0, max_value=150.0, value=50.0)
contract = st.selectbox("Contract Type", ["Month-to-month", "One year", "Two year"])
internet = st.selectbox("Internet Service", ["DSL", "Fiber optic", "No"])

# 3. When the user clicks the "Predict" button...
if st.button("Predict Churn Risk"):
    
    # Store user inputs in a dataframe
    input_data = pd.DataFrame({
        'tenure': [tenure],
        'MonthlyCharges': [monthly_charges],
        'Contract': [contract],
        'InternetService': [internet]
    })
    
    # Apply the same One-Hot Encoding we used during training
    input_encoded = pd.get_dummies(input_data)
    
    # Force the app's columns to match the model's training columns exactly
    input_encoded = input_encoded.reindex(columns=model_columns, fill_value=0)
    
    # 4. Make the prediction using Gradient Boosting
    prediction = model.predict(input_encoded)[0]
    probability = model.predict_proba(input_encoded)[0][1]
    
    # 5. Display the result
    st.subheader("Prediction Result:")
    if prediction == 1:
        st.error(f"🚨 High Risk of Churn! (Probability: {probability:.0%})")
        st.write("Recommendation: Offer a discount or contact them immediately.")
    else:
        st.success(f"✅ Customer is likely to stay! (Churn Probability: {probability:.0%})")