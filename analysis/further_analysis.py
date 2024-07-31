import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Read the CSV files
mystudylife_data = pd.read_csv("MyStudyLife.csv")
leerplan_data = pd.read_csv("LeerPlan.csv")

# Define the factors
factors = ["Perceived Usefulness", "Perceived Ease of Use", 
           "Ease of Data Collection", "Behavioral Intentions", 
           "Active Use", "Satisfaction"]

# Function to calculate averages for each factor by group
def calculate_group_averages(data):
    return data.groupby('Group')[factors].mean().reset_index()

# Calculate averages for each application and group
mystudylife_avg = calculate_group_averages(mystudylife_data)
leerplan_avg = calculate_group_averages(leerplan_data)

# Display tables
print("MyStudyLife Averages:")
print(mystudylife_avg.to_string(index=False))
print("\nLeerPlan Averages:")
print(leerplan_avg.to_string(index=False))

# Function to create comparative bar graph
def create_comparative_bar_graph(data, title):
    plt.figure(figsize=(12, 8))
    sns.set_style("whitegrid")
    
    melted_data = pd.melt(data, id_vars=['Group'], value_vars=factors, 
                          var_name='Factor', value_name='Average')
    
    sns.barplot(x='Factor', y='Average', hue='Group', data=melted_data,
                     palette={'A': '#2DD4BF', 'B': '#99CCFF'})
    
    plt.title(title, fontsize=16)
    plt.xlabel('Factors', fontsize=12)
    plt.ylabel('Average Score', fontsize=12)
    plt.ylim(0, 5)  # Set y-axis limits from 0 to 5
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Group')
    plt.tight_layout()
    
    # Save the plot
    filename = f'{title.replace(" ", "_")}.png'
    plt.savefig(filename, dpi=300)
    print(f"Saved graph: {filename}")
    
    # Display the plot
    plt.show()

# Create comparative bar graphs
create_comparative_bar_graph(mystudylife_avg, "MyStudyLife Group A vs Group B Comparison")
create_comparative_bar_graph(leerplan_avg, "LeerPlan Group A vs Group B Comparison")

# Print current working directory
print(f"\nCurrent working directory: {os.getcwd()}")
print("Check this directory for the saved PNG files.")